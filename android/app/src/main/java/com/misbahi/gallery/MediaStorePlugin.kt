package com.misbahi.gallery

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import java.util.concurrent.Executors

@CapacitorPlugin(
    name = "MediaStorePlugin",
    permissions = [
        Permission(
            alias = "storage",
            strings = [
                android.Manifest.permission.READ_MEDIA_IMAGES,
                android.Manifest.permission.READ_MEDIA_VIDEO,
                android.Manifest.permission.READ_MEDIA_AUDIO,
                android.Manifest.permission.READ_EXTERNAL_STORAGE
            ]
        )
    ]
)
class MediaStorePlugin : Plugin() {

    private lateinit var permissionManager: PermissionManager
    private lateinit var mediaStoreManager: MediaStoreManager
    private lateinit var thumbnailProvider: ThumbnailProvider
    private var mediaObserver: MediaObserver? = null

    // Single-thread executor to serialize blocking MediaStore work off the main thread
    private val worker = Executors.newSingleThreadExecutor()

    override fun load() {
        super.load()
        permissionManager = PermissionManager(context)
        mediaStoreManager = MediaStoreManager(context)
        thumbnailProvider = ThumbnailProvider(context)
    }

    @PluginMethod
    override fun checkPermissions(call: PluginCall) {
        val ret = JSObject()
        val granted = permissionManager.hasPermissions()
        ret.put("granted", granted)
        ret.put("photos", if (granted) "granted" else "denied")
        ret.put("videos", if (granted) "granted" else "denied")
        ret.put("audio", if (granted) "granted" else "denied")
        call.resolve(ret)
    }

    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        if (permissionManager.hasPermissions()) {
            checkPermissions(call)
        } else {
            requestPermissionForAlias("storage", call, "permissionCallback")
        }
    }

    @PermissionCallback
    private fun permissionCallback(call: PluginCall) {
        checkPermissions(call)
    }

    @PluginMethod
    fun scanMediaStore(call: PluginCall) {
        val type = call.getString("type", "all") ?: "all"
        val limit = call.getInt("limit", 5000) ?: 5000
        val offset = call.getInt("offset", 0) ?: 0

        // Run the blocking ContentResolver queries off the main thread.
        worker.execute {
            try {
                val result = mediaStoreManager.scanMediaStore(type, limit, offset)
                val finalResult = result
                bridge.activity.runOnUiThread {
                    call.resolve(finalResult)
                }
            } catch (e: Exception) {
                val msg = e.localizedMessage
                bridge.activity.runOnUiThread {
                    call.reject("Failed to query MediaStore: $msg", e)
                }
            }
        }
    }

    @PluginMethod
    fun getAlbums(call: PluginCall) {
        worker.execute {
            try {
                val scan = mediaStoreManager.scanMediaStore("all", 5000, 0)
                val albums = scan.getJSONArray("albums")
                val result = JSObject()
                result.put("albums", albums)
                val finalResult = result
                bridge.activity.runOnUiThread {
                    call.resolve(finalResult)
                }
            } catch (e: Exception) {
                val msg = e.localizedMessage
                bridge.activity.runOnUiThread {
                    call.reject("Failed to fetch albums: $msg", e)
                }
            }
        }
    }

    @PluginMethod
    fun getThumbnail(call: PluginCall) {
        val mediaIdStr = call.getString("mediaId")
        val mediaType = call.getString("type", "photo") ?: "photo"
        val width = call.getInt("width", 300) ?: 300
        val height = call.getInt("height", 300) ?: 300

        if (mediaIdStr == null) {
            call.reject("mediaId parameter is required")
            return
        }

        // Thumbnail bitmap generation (including base64 encode) can be heavy.
        worker.execute {
            try {
                val mediaId = mediaIdStr.toLong()
                val thumb = thumbnailProvider.getThumbnail(mediaId, mediaType, width, height)
                val result = JSObject()
                result.put("thumbnailUrl", thumb ?: "")
                val finalResult = result
                bridge.activity.runOnUiThread {
                    call.resolve(finalResult)
                }
            } catch (e: Exception) {
                val msg = e.localizedMessage
                bridge.activity.runOnUiThread {
                    call.reject("Thumbnail generation error: $msg", e)
                }
            }
        }
    }

    @PluginMethod
    fun registerMediaObserver(call: PluginCall) {
        try {
            if (mediaObserver == null) {
                mediaObserver = MediaObserver(context) {
                    val event = JSObject()
                    event.put("updated", true)
                    notifyListeners("mediaStoreChanged", event)
                }
            }
            mediaObserver?.register()

            val ret = JSObject()
            ret.put("listenerId", "android_mediastore_observer")
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed registering media observer: ${e.localizedMessage}", e)
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        mediaObserver?.unregister()
        worker.shutdownNow()
    }
}

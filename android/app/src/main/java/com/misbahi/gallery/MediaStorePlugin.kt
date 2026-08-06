package com.misbahi.gallery

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission

@CapacitorPlugin(
    name = "MediaStorePlugin",
    permissions = [
        Permission(
            strings = [
                android.Manifest.permission.READ_MEDIA_IMAGES,
                android.Manifest.permission.READ_MEDIA_VIDEO,
                android.Manifest.permission.READ_MEDIA_AUDIO,
                android.Manifest.permission.READ_EXTERNAL_STORAGE
            ],
            name = "storage"
        )
    ]
)
class MediaStorePlugin : Plugin() {

    private lateinit var permissionManager: PermissionManager
    private lateinit var mediaStoreManager: MediaStoreManager
    private lateinit var thumbnailProvider: ThumbnailProvider
    private var mediaObserver: MediaObserver? = null

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

        try {
            val result = mediaStoreManager.scanMediaStore(type, limit, offset)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to query MediaStore: ${e.localizedMessage}", e)
        }
    }

    @PluginMethod
    fun getAlbums(call: PluginCall) {
        try {
            val scan = mediaStoreManager.scanMediaStore("all", 5000, 0)
            val albums = scan.getJSArray("albums")
            val result = JSObject()
            result.put("albums", albums)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to fetch albums: ${e.localizedMessage}", e)
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

        try {
            val mediaId = mediaIdStr.toLong()
            val thumb = thumbnailProvider.getThumbnail(mediaId, mediaType, width, height)
            val result = JSObject()
            result.put("thumbnailUrl", thumb ?: "")
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Thumbnail generation error: ${e.localizedMessage}", e)
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
    }
}

package com.misbahi.gallery

import android.content.ContentUris
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MediaStoreManager(private val context: Context) {

    fun scanMediaStore(filterType: String = "all", limit: Int = 5000, offset: Int = 0): JSObject {
        val mediaItems = JSArray()
        val albumMap = HashMap<String, JSObject>()

        if (filterType == "all" || filterType == "photo") {
            queryImages(mediaItems, albumMap)
        }
        if (filterType == "all" || filterType == "video") {
            queryVideos(mediaItems, albumMap)
        }
        if (filterType == "all" || filterType == "audio") {
            queryAudio(mediaItems, albumMap)
        }

        val albumsArray = JSArray()
        for (albumObj in albumMap.values) {
            albumsArray.put(albumObj)
        }

        val result = JSObject()
        result.put("items", mediaItems)
        result.put("albums", albumsArray)
        result.put("totalCount", mediaItems.length())
        result.put("hasMore", false)
        return result
    }

    private fun queryImages(items: JSArray, albums: HashMap<String, JSObject>) {
        val projection = arrayOf(
            MediaStore.Images.Media._ID,
            MediaStore.Images.Media.DISPLAY_NAME,
            MediaStore.Images.Media.SIZE,
            MediaStore.Images.Media.DATE_ADDED,
            MediaStore.Images.Media.DATE_TAKEN,
            MediaStore.Images.Media.BUCKET_ID,
            MediaStore.Images.Media.BUCKET_DISPLAY_NAME
        )

        val sortOrder = "${MediaStore.Images.Media.DATE_ADDED} DESC"
        val cursor: Cursor? = context.contentResolver.query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            projection, null, null, sortOrder
        )

        cursor?.use { c ->
            val idColumn = c.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
            val nameColumn = c.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
            val sizeColumn = c.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE)
            val dateAddedColumn = c.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_ADDED)
            val bucketIdColumn = c.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_ID)
            val bucketNameColumn = c.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_DISPLAY_NAME)

            while (c.moveToNext()) {
                val id = c.getLong(idColumn)
                val name = c.getString(nameColumn) ?: "Photo"
                val size = c.getLong(sizeColumn)
                val dateAddedSec = c.getLong(dateAddedColumn)
                val bucketId = c.getString(bucketIdColumn) ?: "camera_bucket"
                val bucketName = c.getString(bucketNameColumn) ?: "Camera"

                val contentUri: Uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
                val isoDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date(dateAddedSec * 1000))

                val item = JSObject()
                item.put("id", id.toString())
                item.put("title", name)
                item.put("type", "photo")
                item.put("source", inferSource(name, bucketName))
                item.put("url", contentUri.toString())
                item.put("thumbnailUrl", contentUri.toString())
                item.put("sizeBytes", size)
                item.put("dateAdded", isoDate)
                item.put("dateTaken", isoDate)
                item.put("year", calendarYear(dateAddedSec))
                item.put("month", calendarMonth(dateAddedSec))
                item.put("albumId", bucketId)
                item.put("albumName", bucketName)
                item.put("tags", JSArray().put("Photo").put(bucketName))
                item.put("isFavorite", false)
                item.put("isHidden", false)
                item.put("isInTrash", false)

                items.put(item)
                updateAlbumMap(albums, bucketId, bucketName, contentUri.toString(), isoDate)
            }
        }
    }

    private fun queryVideos(items: JSArray, albums: HashMap<String, JSObject>) {
        val projection = arrayOf(
            MediaStore.Video.Media._ID,
            MediaStore.Video.Media.DISPLAY_NAME,
            MediaStore.Video.Media.SIZE,
            MediaStore.Video.Media.DATE_ADDED,
            MediaStore.Video.Media.DURATION,
            MediaStore.Video.Media.BUCKET_ID,
            MediaStore.Video.Media.BUCKET_DISPLAY_NAME
        )

        val sortOrder = "${MediaStore.Video.Media.DATE_ADDED} DESC"
        val cursor: Cursor? = context.contentResolver.query(
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
            projection, null, null, sortOrder
        )

        cursor?.use { c ->
            val idColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
            val nameColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME)
            val sizeColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE)
            val dateAddedColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_ADDED)
            val durationColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION)
            val bucketIdColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media.BUCKET_ID)
            val bucketNameColumn = c.getColumnIndexOrThrow(MediaStore.Video.Media.BUCKET_DISPLAY_NAME)

            while (c.moveToNext()) {
                val id = c.getLong(idColumn)
                val name = c.getString(nameColumn) ?: "Video"
                val size = c.getLong(sizeColumn)
                val dateAddedSec = c.getLong(dateAddedColumn)
                val durationMs = c.getLong(durationColumn)
                val bucketId = c.getString(bucketIdColumn) ?: "video_bucket"
                val bucketName = c.getString(bucketNameColumn) ?: "Movies"

                val contentUri: Uri = ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id)
                val isoDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date(dateAddedSec * 1000))

                val item = JSObject()
                item.put("id", id.toString())
                item.put("title", name)
                item.put("type", "video")
                item.put("source", inferSource(name, bucketName))
                item.put("url", contentUri.toString())
                item.put("thumbnailUrl", contentUri.toString())
                item.put("sizeBytes", size)
                item.put("duration", formatDuration(durationMs))
                item.put("dateAdded", isoDate)
                item.put("dateTaken", isoDate)
                item.put("year", calendarYear(dateAddedSec))
                item.put("month", calendarMonth(dateAddedSec))
                item.put("albumId", bucketId)
                item.put("albumName", bucketName)
                item.put("tags", JSArray().put("Video").put(bucketName))
                item.put("isFavorite", false)

                items.put(item)
                updateAlbumMap(albums, bucketId, bucketName, contentUri.toString(), isoDate)
            }
        }
    }

    private fun queryAudio(items: JSArray, albums: HashMap<String, JSObject>) {
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.DATE_ADDED,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM
        )

        val cursor: Cursor? = context.contentResolver.query(
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
            projection, null, null, "${MediaStore.Audio.Media.DATE_ADDED} DESC"
        )

        cursor?.use { c ->
            val idColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val nameColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
            val sizeColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
            val dateAddedColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)
            val durationColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val artistColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)

            while (c.moveToNext()) {
                val id = c.getLong(idColumn)
                val name = c.getString(nameColumn) ?: "Audio Track"
                val size = c.getLong(sizeColumn)
                val dateAddedSec = c.getLong(dateAddedColumn)
                val durationMs = c.getLong(durationColumn)
                val artist = c.getString(artistColumn) ?: "Unknown Artist"
                val albumName = c.getString(albumColumn) ?: "Music"

                val contentUri: Uri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)
                val isoDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date(dateAddedSec * 1000))

                val item = JSObject()
                item.put("id", id.toString())
                item.put("title", name)
                item.put("type", "audio")
                item.put("source", "music")
                item.put("url", contentUri.toString())
                item.put("thumbnailUrl", "")
                item.put("sizeBytes", size)
                item.put("duration", formatDuration(durationMs))
                item.put("artist", artist)
                item.put("dateAdded", isoDate)
                item.put("year", calendarYear(dateAddedSec))
                item.put("month", calendarMonth(dateAddedSec))
                item.put("albumName", albumName)
                item.put("tags", JSArray().put("Audio").put("Music"))

                items.put(item)
            }
        }
    }

    private fun updateAlbumMap(albums: HashMap<String, JSObject>, bucketId: String, bucketName: String, coverUrl: String, dateAdded: String) {
        if (!albums.containsKey(bucketId)) {
            val album = JSObject()
            album.put("id", bucketId)
            album.put("name", bucketName)
            album.put("coverUrl", coverUrl)
            album.put("itemCount", 1)
            album.put("category", "source")
            album.put("createdAt", dateAdded)
            album.put("description", "$bucketName Folder")
            albums[bucketId] = album
        } else {
            val album = albums[bucketId]!!
            val currentCount = album.getInt("itemCount")
            album.put("itemCount", currentCount + 1)
        }
    }

    private fun inferSource(fileName: String, bucketName: String): String {
        val name = "$fileName $bucketName".lowercase()
        return when {
            name.contains("whatsapp") -> "whatsapp"
            name.contains("telegram") -> "telegram"
            name.contains("screenshot") -> "screenshots"
            name.contains("download") -> "downloads"
            name.contains("camera") || name.contains("dcim") -> "camera"
            name.contains("screen") -> "screen_recording"
            name.contains("bluetooth") -> "bluetooth"
            name.contains("movie") || name.contains("video") -> "movies"
            name.contains("music") || name.contains("song") -> "music"
            else -> "camera"
        }
    }

    private fun calendarYear(sec: Long): Int {
        val sdf = SimpleDateFormat("yyyy", Locale.US)
        return sdf.format(Date(sec * 1000)).toIntOrNull() ?: 2026
    }

    private fun calendarMonth(sec: Long): String {
        val sdf = SimpleDateFormat("MMMM yyyy", Locale.US)
        return sdf.format(Date(sec * 1000))
    }

    private fun formatDuration(ms: Long): String {
        val totalSec = ms / 1000
        val mins = totalSec / 60
        val secs = totalSec % 60
        return String.format(Locale.US, "%d:%02d", mins, secs)
    }
}

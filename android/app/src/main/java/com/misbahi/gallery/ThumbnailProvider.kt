package com.misbahi.gallery

import android.content.ContentUris
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Base64
import android.util.Size
import java.io.ByteArrayOutputStream

class ThumbnailProvider(private val context: Context) {

    fun getThumbnail(mediaId: Long, mediaType: String, width: Int = 300, height: Int = 300): String? {
        return try {
            val contentUri: Uri = when (mediaType.lowercase()) {
                "video" -> ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, mediaId)
                "audio" -> ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, mediaId)
                else -> ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, mediaId)
            }

            val bitmap: Bitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                context.contentResolver.loadThumbnail(contentUri, Size(width, height), null)
            } else {
                if (mediaType.equals("video", ignoreCase = true)) {
                    MediaStore.Video.Thumbnails.getThumbnail(
                        context.contentResolver, mediaId,
                        MediaStore.Video.Thumbnails.MINI_KIND, null
                    )
                } else {
                    MediaStore.Images.Thumbnails.getThumbnail(
                        context.contentResolver, mediaId,
                        MediaStore.Images.Thumbnails.MINI_KIND, null
                    )
                }
            } ?: return contentUri.toString()

            val byteArrayOutputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream)
            val byteArray = byteArrayOutputStream.toByteArray()
            "data:image/jpeg;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

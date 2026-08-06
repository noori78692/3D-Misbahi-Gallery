package com.misbahi.gallery

import android.content.Context
import android.database.ContentObserver
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore

class MediaObserver(
    private val context: Context,
    private val onChangeCallback: () -> Unit
) : ContentObserver(Handler(Looper.getMainLooper())) {

    private var isRegistered = false

    // Debounce MediaStore onChange bursts (e.g. a batch of new files)
    private val debounceHandler = Handler(Looper.getMainLooper())
    private val debounceRunnable = Runnable { onChangeCallback() }

    fun register() {
        if (!isRegistered) {
            val resolver = context.contentResolver
            resolver.registerContentObserver(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, true, this)
            resolver.registerContentObserver(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, true, this)
            resolver.registerContentObserver(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, true, this)
            isRegistered = true
        }
    }

    fun unregister() {
        if (isRegistered) {
            context.contentResolver.unregisterContentObserver(this)
            debounceHandler.removeCallbacks(debounceRunnable)
            isRegistered = false
        }
    }

    override fun onChange(selfChange: Boolean) {
        super.onChange(selfChange)
        // Debounce bursts of MediaStore change events to a single callback
        debounceHandler.removeCallbacks(debounceRunnable)
        debounceHandler.postDelayed(debounceRunnable, 500)
    }
}
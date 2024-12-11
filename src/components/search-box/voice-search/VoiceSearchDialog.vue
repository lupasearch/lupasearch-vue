<script lang="ts" setup>
import { ref } from 'vue';

const socket = ref<WebSocket | null>(null);
const isRecordingRef = ref<boolean>(false);
const mediaStream = ref<MediaStream | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const timesliceLimit = ref<number>(3);
const transcription = ref('');

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits(['close', 'stopRecognize']);

const closeDialog = (): void => {
  emit('close');
};

const stopRecognize = (): void => {
  emit('stopRecognize', transcription.value);
};

const handleOverlayClick = (e: MouseEvent): void => {
  if ((e.target as HTMLElement).classList.contains('dialog-overlay')) {
    closeDialog();
  }
};

const startRecognize = async () => {
  console.log('Recognizing...');

  if (
    isRecordingRef.value ||
    (mediaRecorder.value && mediaRecorder.value.state === 'recording')
  ) {
    throw new Error('MediaRecorder is not prepared or already recording');
  }

  try {
    socket.value = new WebSocket('ws://localhost:3000?lang=en-US&connectionType=write-first');

    socket.value.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.value.onmessage = (event) => {
      const messageObj = JSON.parse(event.data);
      console.log('WebSocket message:', messageObj);

      if (messageObj.event === 'transcription') {
        console.log('Transcription:', messageObj.transcription);
        transcription.value = messageObj.transcription;
        stopRecording();
      }
    };

    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.value.onclose = () => {
      console.log('WebSocket connection closed');
    };

    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false,
        sampleRate: 16000,
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaStream.value = stream;
    mediaRecorder.value = new MediaRecorder(stream);
    mediaRecorder.value.ondataavailable = onDataAvailableHandler;
    mediaRecorder.value.onstop = onStopHandler;
    mediaRecorder.value.start(1000); // Send chunks every second
    isRecordingRef.value = true;

    setTimeout(() => {
      if (isRecordingRef.value) {
        console.log('Recording limit reached');
        stopRecording();
      }
    }, timesliceLimit.value * 1000);
  } catch (error) {
    console.error('Error during recording start:', error);
    return;
  }
};

const stopRecording = () => {
  console.log('Recording stopped...');

  if (
    !mediaRecorder.value || 
    !isRecordingRef.value || 
    mediaRecorder.value?.state === 'inactive'
  ) {
    throw new Error('MediaRecorder is not prepared or not recording');
  }

  try {
    mediaRecorder.value?.stop();
    mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });

    console.log('Sending audio-chunk-end message...');
    socket.value?.send(JSON.stringify({ event: 'audio-chunk-end' }));
    isRecordingRef.value = false;

    stopRecognize();
  } catch (error) {
    console.error('Error during recording stop:', error);
    return;
  }
};

const onDataAvailableHandler = (event: BlobEvent) => {
  console.log('Data available...');
  if (mediaRecorder.value?.state !== 'recording') {
    return;
  }

  console.log('Sending audio chunk...');
  // Encode audio data to base64
  const reader = new FileReader();
  reader.readAsDataURL(event.data); 
  reader.onloadend = () => {
    const base64DataChunks = reader.result as string;
    const base64Data = base64DataChunks.split(',')[1];
    socket.value?.send(JSON.stringify({ event: 'audio-chunk', data: base64Data }));
  };
};

const onStopHandler = () => {
  stopRecording();
};
</script>

<template>
  <div>
    <div v-if="props.isOpen" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog-box">
        <button
          class="dialog-box-close-button"
          @click="closeDialog"
        >
          X
        </button>
        
        <div class="dialog-content">
          <p class="listening-text">Listening...</p>

          <button 
            class="mic-button"
            @click="startRecognize"
          >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

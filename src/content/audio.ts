import wind from '../../public/wind.wav';

let isPlaying = false;
const audio = new Audio(wind);
audio.volume = 0.8;
audio.loop = true;

export const initAudio = (canvas: HTMLCanvasElement) => {
   const muteBtn = document.getElementById('mute-btn');
   muteBtn.onclick = (event: MouseEvent) => toggleAudio(event.target as HTMLElement);
   const isMuted = JSON.parse(localStorage.getItem('isMuted'));
   if (!isMuted) {
      canvas.onmousedown = () => {
         canvas.onmousedown = null;
         toggleAudio(muteBtn);
      };
   }
};

export const toggleAudio = (button: HTMLElement) => {
   localStorage.setItem('isMuted', isPlaying.toString());
   isPlaying = !isPlaying;
   if (isPlaying) {
      button.classList.remove('is-muted');
      audio.play();
   } else {
      button.classList.add('is-muted');
      audio.pause();
   }
};

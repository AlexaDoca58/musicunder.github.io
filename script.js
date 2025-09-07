document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const trackTitle = document.getElementById('track-title');
    const tracklistUl = document.getElementById('tracklist-ul');
    const visualizerCanvas = document.getElementById('frequency-visualizer');
    const canvasCtx = visualizerCanvas.getContext('2d');
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    const tracks = [

        // Asegúrate de que los nombres de archivo sean EXACTOS como en tu carpeta.

        { title: '01. Once Upon a Time', src: './Audio/01. Once Upon A Time.mp3' },

        { title: '02. Fallen Down', src: './Audio/04. Fallen Down.mp3' },

        { title: '03. Your Best Friend', src: './Audio/03. Your Best Friend.mp3' },

        { title: '04. Ruins', src: './Audio/05. Ruins.mp3' },

        { title: '05. Heartache', src: './Audio/14. Heartache.mp3' },

        { title: '06. Snowdin Town', src: './Audio/22. Snowdin Town.mp3' },

        { title: '07. Bonetrousle', src: './Audio/24. Bonetrousle.mp3' },

        { title: '08. Waterfall', src: './Audio/31. Waterfall.mp3' },

        { title: '09. Temmie Village', src: './Audio/43. Temmie Village.mp3' },

        { title: '10. Spear of Justice', src: './Audio/46. Spear of Justice.mp3' },

        { title: '11. Dating Start!', src: './Audio/25. Dating Start!.mp3' },

        { title: '12. Death by Glamour', src: './Audio/67. Death by Glamour.mp3' },

        { title: '13. Spider Dance', src: './Audio/58. Spider Dance.mp3' },

        { title: '14. ASGORE', src: './Audio/74. ASGORE.mp3' },

        { title: '15. MEGALOVANIA', src: './Audio/94. MEGALOVANIA.mp3' }

    ];

    const audio = new Audio();
    let currentTrackIndex = 0;
    let audioContext;
    let analyser;
    let source;
    let dataArray;

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const initAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256; 
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }
    };

    const drawVisualizer = () => {
        requestAnimationFrame(drawVisualizer);
        if (audio.paused && audioContext && audioContext.state === 'suspended') {
            return;
        }
        analyser.getByteFrequencyData(dataArray);

        visualizerCanvas.width = visualizerCanvas.offsetWidth;
        visualizerCanvas.height = visualizerCanvas.offsetHeight;
        canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

        const bufferLength = analyser.frequencyBinCount; 
        const barWidth = visualizerCanvas.width / bufferLength; 
        let x = 0;

        for (let i = 0; i < bufferLength; i++) { 
            const barHeight = dataArray[i] * (visualizerCanvas.height / 255); 

            const hue = i / bufferLength * 360; 
            canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            canvasCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight); 
            x += barWidth;
        }
    };

    const loadTrack = (index) => {
        currentTrackIndex = index;
        audio.src = tracks[currentTrackIndex].src;
        trackTitle.textContent = tracks[currentTrackIndex].title;
        progressBar.value = 0;
        currentTimeEl.textContent = '0:00';
        audio.onloadedmetadata = () => {
            progressBar.max = audio.duration;
            durationEl.textContent = formatTime(audio.duration);
        };
    };

    const togglePlayPause = () => {
        initAudioContext();
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            drawVisualizer();
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    };
    
    const playNextTrack = () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        drawVisualizer();
    };

    playPauseBtn.addEventListener('click', togglePlayPause);

    audio.addEventListener('ended', () => {
        playNextTrack();
    });

    const renderTracklist = () => {
        tracklistUl.innerHTML = '';
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="track-number">${track.title}</span>`;
            li.addEventListener('click', () => {
                loadTrack(index);
                togglePlayPause();
            });
            tracklistUl.appendChild(li);
        });
    };
    
    const handleNavClick = (event) => {
        navItems.forEach(item => item.classList.remove('active'));
        event.target.classList.add('active');
        contentSections.forEach(section => section.classList.remove('active'));
        const sectionToShow = document.getElementById(event.target.dataset.section + '-section');
        if (sectionToShow) {
            sectionToShow.classList.add('active');
        }
    };

    audio.addEventListener('timeupdate', () => {
        progressBar.value = audio.currentTime;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    progressBar.addEventListener('input', () => {
        audio.currentTime = progressBar.value;
    });

    navItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    loadTrack(currentTrackIndex);
    renderTracklist();
});
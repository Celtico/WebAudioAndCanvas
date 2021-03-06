
var screenWidth    = window.innerWidth;
var video          = document.querySelector("#videoElement");
var video_element  = document.getElementById('videoElement');
var canvas         = document.getElementById('canvas');
canvas.setAttribute('width','29');
canvas.setAttribute('height','20');
var bulletSize     = 40;
var radius         = bulletSize / 2;
if(screenWidth < 700){
    canvas.setAttribute('width','20');
    canvas.setAttribute('height','15');
    bulletSize     = 36;
    radius         = bulletSize / 2;
}
var context        = canvas.getContext('2d');
var canvas_width   = canvas.width;
var canvas_height  = canvas.height;
var canvas2        = document.getElementById('canvas2');
var context2       = canvas2.getContext('2d');
var canvas_width2  = canvas2.width;
var canvas_height2 = canvas2.height;
var canvasVideo    = document.getElementById('canvasVideo');
var waveCanvas = document.getElementById('waveCanvas');
if(screenWidth < 700){
    canvasVideo.setAttribute('width','280');
    canvasVideo.setAttribute('height','180');
    waveCanvas.setAttribute('width','280');
    waveCanvas.setAttribute('height','130');
}
var contextVideo   = canvasVideo.getContext('2d');
var cv_width       = canvasVideo.width;
var cv_height      = canvasVideo.height;
var gray           = '0';
var CanvasVideoFrame = null;
var img            = document.getElementById('img');
var file           = document.getElementById("file");
var audioElement   = document.querySelector("#audioElement");
var file_audio     = document.getElementById("file_audio");
var delta          = 8;
var colorToFreq    = SpectrumToRgb();
var imageData;
var isPlaying = false;
var isMicro = false;
var myAudioContext,
    myAudioAnalyser,
    myBuffers = {},
    mySource,
    SpectrumAnimationFrame = null,
    myNodes = {},
    request,
    highpass,
    BANDPASS,
    panX,
    source,
    mp3 = 'MakeYourMoveFt.Goapele.mp3',
    spectrumType = 1,
    vel_espect = 0.95,
    value_hue = 0,
    value_saturation =  0,
    value_lightness = 0,
    isUnlocked = false;


    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;
        myAudioContext = new AudioContext();

        fetchSounds();

    } catch(e) {

        alert('Este navegador no soporta la API de audio');

    }


/**
 * MENU Media
 * */
document.getElementById("webcam").addEventListener("click",webCam, false);
document.getElementById("micro").addEventListener("click",Micro, false);
document.getElementById("imatgeUp").addEventListener("click",Imatge, false);
document.getElementById("audio").addEventListener("click",Audio, false);
document.getElementById("play").setAttribute('style','opacity:0.2');


document.getElementById("close").addEventListener("click",function(){
    document.getElementById("nav").setAttribute('style','display:none');
    canvas2.setAttribute('style','margin-left:0; margin-top:0;');
}, false);
document.getElementById("open").addEventListener("click",function(){
    document.getElementById("nav").setAttribute('style','display:block');
    canvas2.setAttribute('style','margin-left:190px; margin-top: 17px;');
}, false);



/**
 * Media
 * */
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
function webCam() {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true,audio: false}, handleVideo, videoError);
    }
}
function Micro() {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: true,video: false}, handleAudio, audioError);
    }
}
function audioError(e) { console.log(e); }
function videoError(e) { console.log(e); }



/**
 * VIDEO
 * */
function handleVideo(stream) {
    contextVideo.clearRect(0, 0,cv_width,cv_height);
    video.src = window.URL.createObjectURL(stream);
    video_element = document.getElementById('videoElement');
    document.getElementById("webcam").classList.add("active");
    document.getElementById("imatgeUp").classList.remove("active");
}



var imgLoader = new Image();
imgLoader.onload = function () {
    video_element = img;
    contextVideo.drawImage(img,0,0,cv_width,cv_height);
    document.getElementById("webcam").classList.remove("active");
    document.getElementById("imatgeUp").classList.add("active");
    playVideo();
};
imgLoader.src = img.src;


function Imatge(){

    file.click();

}
file.onchange = function(e){

    for (var i = 0; i < e.srcElement.files.length; i++) {
        var file = e.srcElement.files[i];
        var reader = new FileReader();
        reader.onloadend = function() {
            img.src = reader.result;

            var imgLoader = new Image();
            imgLoader.onload = function () {

                video_element = img;
                contextVideo.drawImage(img,0,0,cv_width,cv_height);
                document.getElementById("webcam").classList.remove("active");
                document.getElementById("imatgeUp").classList.add("active");
                playVideo();

            };
            imgLoader.src = img.src;

        };
        reader.readAsDataURL(file);
    }
};

/**
 * AUDIO
 * */
function handleAudio(stream) {

    if(!isMicro){

        pauseSound();
        document.getElementById("play").innerHTML  = "Play";
        isPlaying = false;
        source = myAudioContext.createMediaStreamSource(stream);
        myAudioAnalyser = myAudioContext.createAnalyser();
        myAudioAnalyser.smoothingTimeConstant = vel_espect;
        myAudioAnalyser.fftSize = 2048;
        source.connect(myAudioAnalyser);
        SpectrumAnimationStart();
        VideoAnimationStart();
        isMicro = true;
        document.getElementById("micro").classList.add("active");
        document.getElementById("audio").classList.remove("active");

    } else{

        if(typeof source !== 'undefined'){
            source.disconnect();
        }
        isMicro = false;
        document.getElementById("micro").classList.remove("active");
        document.getElementById("audio").classList.add("active");
    }
}



function Audio() {
    pauseSound();
    document.getElementById("play").innerHTML  = "Play";
    isPlaying = false;
    file_audio.click();
}
file_audio.onchange = function(e){
    for (var i = 0; i < e.srcElement.files.length; i++) {
        document.getElementById("play").setAttribute('style','opacity:0.2');
        var file = e.srcElement.files[i];
        var reader = new FileReader();
        reader.onloadend = function(fileEvent) {
            var data = fileEvent.target.result;
            audioBuffer(data);
        };
        reader.readAsArrayBuffer(file);
    }
};

function audioBuffer(data) {

    if(myAudioContext.decodeAudioData) {
        myAudioContext.decodeAudioData(data, function(buffer) {
            myBuffers = buffer;
        }, function() {
            alert("Decoding the audio buffer failed");
        });
    } else {
        myBuffers = myAudioContext.createBuffer(data,false);
    }

    setTimeout(function(){
        document.getElementById("play").setAttribute('style','opacity:1');
    },1000);
}


function fetchSounds() {
    document.getElementById("play").setAttribute('style','opacity:0.2');
    request = new XMLHttpRequest();
    request.open('GET', mp3 , true);
    request.responseType = 'arraybuffer';
    request.addEventListener('load',function(event){
        audioBuffer(event.target.response);
    }, false);
    request.send();
}

function playSound() {
    SpectrumAnimationStop();
    VideoAnimationStop();
    myAudioAnalyser = myAudioContext.createAnalyser();
    myAudioAnalyser.smoothingTimeConstant = vel_espect;
    myAudioAnalyser.fftSize = 2048;
    myAudioAnalyser.connect(myAudioContext.destination);
    source = myAudioContext.createBufferSource();
    source.buffer = myBuffers;
    source.loop = true;
    source = routeSound(source);
    source.noteOn(0);
    SpectrumAnimationStart();
    VideoAnimationStart();
    mySource = source;
}

function routeSound(source) {
    myNodes.filter = myAudioContext.createBiquadFilter();
    myNodes.panner = myAudioContext.createPanner();
    myNodes.volume = myAudioContext.createGainNode();
    var panX = document.querySelector('#pan').value;
    var volume = document.querySelector('#volume').value;



    myNodes.filter.type = "highpass";
    myNodes.filter.frequency.value = 0;


    myNodes.panner.setPosition(panX, 0, 0);
    myNodes.volume.gain.value = volume;
    source.connect(myNodes.filter);
    myNodes.filter.connect(myNodes.panner);
    myNodes.panner.connect(myNodes.volume);
    myNodes.volume.connect(myAudioAnalyser);
    return source;
}



 function changeFrequency(element) {
    var minValue = 100;
    var maxValue = myAudioContext.sampleRate / 2;
    var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
    var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
     myNodes.filter.frequency.value = maxValue * multiplier;
}
function changeQuality(element) {
    myNodes.filter.Q.value = element.value *  30;
}


function pauseSound() {
    if(typeof mySource !== 'undefined'){
        source = mySource;
        source.noteOff(0);
        document.getElementById("play").classList.remove("active");
    }
}

function toggleSound(button) {
    if(!isPlaying) {
        playSound();
        button.innerHTML  = "Stop";
        isPlaying = true;
        isMicro = false;
        document.getElementById("micro").classList.remove("active");
        document.getElementById("audio").classList.add("active");
        document.getElementById("play").classList.add("active");
    }
    else {
        pauseSound();
        button.innerHTML  = "Play";
        isPlaying = false;
    }
}

function sliderChange(slider) {

    if(typeof myNodes.volume !== 'undefined'){


        if(slider.id == 'frequency') {
            changeFrequency(slider);
        }
        else if(slider.id == 'quality') {
            changeQuality(slider);
        }

        else if(slider.id == 'pan') {
            panX = slider.value;
            myNodes.panner.setPosition(panX, 0, 0);
        }
        else if(slider.id == 'volume') {
            volume = slider.value;
            myNodes.volume.gain.value = volume;
        }
    }

}


function drawSpectrum() {
    var canvas = document.querySelector('#waveCanvas');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var bar_width = 2;
    var bar_width_next = 1;
    if(screenWidth < 700){
        bar_width = 15;
        bar_width_next = 14;
    }
    ctx.clearRect(0, 0, width, height);
    var freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
    if(spectrumType == 0){
        myAudioAnalyser.getByteTimeDomainData(freqByteData);
    }else{
        myAudioAnalyser.getByteFrequencyData(freqByteData);
    }
    var barCount = Math.round(width / bar_width);
    for (var i = 0; i < barCount; i++) {
        var magnitude = freqByteData[i];
        ctx.fillRect(bar_width * i, height, bar_width - bar_width_next, - magnitude + 130);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
    }
    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    SpectrumAnimationFrame = window.requestAnimationFrame( drawSpectrum );
}



function SpectrumAnimationStart() {
    if (!SpectrumAnimationFrame ) {
        drawSpectrum();
    }
}

function SpectrumAnimationStop() {
    if (SpectrumAnimationFrame) {
        window.cancelAnimationFrame(SpectrumAnimationFrame);
        SpectrumAnimationFrame  = undefined;
    }
}


/**
 * Video
 */
function playVideo() {

    context2.clearRect(0, 0, canvas_width2, canvas_height2);

    var freqRadius = radius;

    if(typeof myAudioAnalyser !== 'undefined'){
        var freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
        if(spectrumType == 0){
            myAudioAnalyser.getByteTimeDomainData(freqByteData);
        }else{
            myAudioAnalyser.getByteFrequencyData(freqByteData);
        }
    }

    if(video_element.src != ''){
        context.drawImage(video_element,0,0,canvas_width,canvas_height);
    }

    for (var x = 0; x < (canvas_width); x++) {
        for (var y = 0; y < (canvas_height); y++) {

            imageData = context.getImageData(x, y,canvas_width,canvas_height);

            imageData = brightness(imageData);

            if(typeof myAudioAnalyser !== 'undefined'){
                var colorSum = imageData.data[0] + imageData.data[1] + imageData.data[2];
                freqRadius = (freqByteData[colorToFreq[colorSum]] * radius) / 150;
            }else{
                freqRadius = radius;
            }

            imageData = hueSat(imageData);

            var centerX = x * bulletSize + bulletSize / 2;
            var centerY = y * bulletSize + bulletSize / 2;

            forms(
                context2,
                centerY,
                centerX,
                "rgb(" + imageData.data[0] + ',' +  imageData.data[1]  + ',' +  imageData.data[2]  + ")",
                freqRadius
            );

        }
    }
    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    CanvasVideoFrame = window.requestAnimationFrame( playVideo );
}


var sizeX;
var sizeY;
var forma = 1;
function formaChange(e){
    forma = e.value;
}

function forms(ctx,y,x,color,freq){

    if(forma == 1 || forma == 2){
        rendones(ctx,y,x,color,freq);
    }else if(forma == 20){
        lletres(ctx,y,x,color,freq,'M');
    }else if(forma == 19){
        lletres(ctx,y,x,color,freq,'K');
    }else if(forma == 18){
        lletres(ctx,y,x,color,freq,'J');
    }else if(forma == 17){
        lletres(ctx,y,x,color,freq,'I');
    }else if(forma == 16){
        lletres(ctx,y,x,color,freq,'H');
    }else if(forma == 15){
        lletres(ctx,y,x,color,freq,'G');
    }else if(forma == 14){
        lletres(ctx,y,x,color,freq,'F');
    }else if(forma == 13){
        lletres(ctx,y,x,color,freq,'E');
    }else if(forma == 12){
        lletres(ctx,y,x,color,freq,'D');
    }else if(forma == 11){
        lletres(ctx,y,x,color,freq,'C');
    }else if(forma == 10){
        lletres(ctx,y,x,color,freq,'B');
    }else if(forma == 9){
        lletres(ctx,y,x,color,freq,'A');
    }else{
        polygon(ctx, x, y, freq, forma,color);
    }

}

function polygon(ctx, x, y, radius, sides,color) {

    var a = (Math.PI * 2)/sides;
    ctx.beginPath();
    ctx.moveTo(x + radius,y);
    for (var i = 1; i < sides; i++) {
        ctx.lineTo(x + ( radius*Math.cos(a*i) ),y + (radius*Math.sin(a*i)));
    }
    ctx.fillStyle = color;
    ctx.fill();

}
function rendones(ctx,y,x,color,freq){

    ctx.beginPath();
    ctx.arc(x, y, freq, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}
function lletres(ctx,y,x,color,freq,lletra){
    sizeX = x - (freq * 3);
    sizeY = y + (freq * 3);
    ctx.font = ( freq * 6 ) + "px Arial";
    ctx.fillStyle = color;
    ctx.fillText(lletra,sizeX,sizeY);
}


function VideoAnimationStart() {
    if (!CanvasVideoFrame) {
        playVideo();
    }
}

function VideoAnimationStop() {
    if (CanvasVideoFrame) {
        window.cancelAnimationFrame(CanvasVideoFrame);
        CanvasVideoFrame  = undefined;
    }
}





/**
 * Range
 */

var brillo = document.getElementById('brillo');
brillo.onchange = function(){
    context2.clearRect(0, 0, canvas_width2, canvas_height2);
    delta = brillo.value / 1.01;
};

var slider = document.getElementById('slider');
slider.onchange = function(){
    context2.clearRect( 0, 0, canvas_width2, canvas_height2);
    radius =  slider.value / 2;
};

var puns = document.getElementById('puns');
puns.onchange = function(){
    context2.clearRect( 0, 0, canvas_width2, canvas_height2);
    bulletSize =  puns.value * 1.01;
};

var body   = document.getElementById('body');
var fons   = document.getElementById('fons');
fons.onchange = function(){
    body.setAttribute('style','background-color:rgba(0, 0, 0, 0.'+fons.value+')');
};



/**
 * Brillo
 */
function brightness(pixels) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
        d[i] += delta;     // red
        d[i + 1] += delta; // green
        d[i + 2] += delta; // blue
    }
    return pixels;
}


/**
 * grayScale
 */

function hueChange(e){
    value_hue = e.value;
}
function saturationChange(e){
    value_saturation = e.value;
}
function lightnessChange(e){
    value_lightness = e.value;
}
function hueSat(pixels) {

    var satMul, h, s,v;
    var hue = parseInt(value_hue,10)||0;
    var saturation = (parseInt(value_saturation,10)||0) / 100;
    var lightness = (parseInt(value_lightness,10)||0) / 100;


    if (saturation < 0) {
       satMul = 1+saturation;
    } else {
       satMul = 1+saturation*2;
    }

    hue = (hue%360) / 360;
    var hue6 = hue * 6;
    var light255 = lightness * 255;
    var lightp1 = 1 + lightness;
    var lightm1 = 1 - lightness;


    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {

        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];

        //d[i]      = ((r+g+b)/3);
       // d[i + 1]  = ((r+g+b)/3);
       // d[i + 2]  = ((r+g+b)/3);

        if (hue != 0 || saturation != 0 || lightness != 0) {
            var vs = r;
            if (g > vs) vs = g;
            if (b > vs) vs = b;
            var ms = r;
            if (g < ms) ms = g;
            if (b < ms) ms = b;
            var vm = (vs-ms);
            var l = (ms+vs)/510;
            if (l > 0) {
                if (vm > 0) {
                    if (l <= 0.5) {
                         s = vm / (vs+ms) * satMul;
                        if (s > 1) s = 1;
                         v = (l * (1+s));
                    } else {
                         s = vm / (510-vs-ms) * satMul;
                        if (s > 1) s = 1;
                         v = (l+s - l*s);
                    }
                    if (r == vs) {
                        if (g == ms)
                            h = 5 + ((vs-b)/vm) + hue6;
                        else
                             h = 1 - ((vs-g)/vm) + hue6;
                    } else if (g == vs) {
                        if (b == ms)
                             h = 1 + ((vs-r)/vm) + hue6;
                        else
                             h = 3 - ((vs-b)/vm) + hue6;
                    } else {
                        if (r == ms)
                             h = 3 + ((vs-g)/vm) + hue6;
                        else
                             h = 5 - ((vs-r)/vm) + hue6;
                    }
                    if (h < 0) h+=6;
                    if (h >= 6) h-=6;
                    var m = (l+l-v);
                    var sextant = h>>0;
                    if (sextant == 0) {
                        r = v*255; g = (m+((v-m)*(h-sextant)))*255; b = m*255;
                    } else if (sextant == 1) {
                        r = (v-((v-m)*(h-sextant)))*255; g = v*255; b = m*255;
                    } else if (sextant == 2) {
                        r = m*255; g = v*255; b = (m+((v-m)*(h-sextant)))*255;
                    } else if (sextant == 3) {
                        r = m*255; g = (v-((v-m)*(h-sextant)))*255; b = v*255;
                    } else if (sextant == 4) {
                        r = (m+((v-m)*(h-sextant)))*255; g = m*255; b = v*255;
                    } else if (sextant == 5) {
                        r = v*255; g = m*255; b = (v-((v-m)*(h-sextant)))*255;
                    }
                }
            }

            if (lightness < 0) {
                r *= lightp1;
                g *= lightp1;
                b *= lightp1;
            } else if (lightness > 0) {
                r = r * lightm1 + light255;
                g = g * lightm1 + light255;
                b = b * lightm1 + light255;
            }

            if (r < 0)
                d[i] = 0;
            else if (r > 255)
                d[i] = 255;
            else
                d[i] = r;

            if (g < 0)
                d[i + 1] = 0;
            else if (g > 255)
                d[i + 1] = 255;
            else
                d[i + 1] = g;

            if (b < 0)
                d[i + 2] = 0;
            else if (b > 255)
                d[i + 2] = 255;
            else
                d[i + 2] = b;

        }

    }
    return pixels;
}




/**
 * Spectrum to RGB
 */
function SpectrumToRgb(){
    var max_color = 765 + 1;
    var max_freq  = 1024 + 1;
    var colorToFreq =  [];
    for(var i = 0; i < max_color; i++) {
        colorToFreq.push(Math.round((i *  max_freq) / max_color));
    }
    return colorToFreq;
}



function spectrumChange(){
    if(spectrumType == 0){
        spectrumType = 1;
        document.getElementById('velEsp').setAttribute('style','display:block');
    }else if(spectrumType == 1){
        spectrumType = 0;
        document.getElementById('velEsp').setAttribute('style','display:none');
    }
}


function definicioChange(e){
    var width    = e.value * 0.7;
    var height   = (width * canvas.height) / canvas.width;
    canvas.height = Math.round(height);
    canvas.width  = Math.round(width);
    canvas_width  = Math.round(width);
    canvas_height = Math.round(height);
}


function velSpectrumChange(e){
    vel_espect  = e.value * 0.01;
    myAudioAnalyser.smoothingTimeConstant = vel_espect;
}

function toggleSection(e){
    var bodySection = e.nextSibling.nextSibling;
    bodySection.style.display == "block" ?  bodySection.style.display = "none" :
    bodySection.style.display = "block";
}

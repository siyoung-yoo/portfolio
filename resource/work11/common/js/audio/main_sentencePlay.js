
let containerS;
let audioPlayBtn;
let mediaObject;
let volume = 50;
let scriptItems = [];
let isOneScriptOnly = false;
let ad;

function initMediaObject() {
    let options ={
        type: MediaType.AUDIO,
        autoplay: false,
        isiOS: isiOS(),
        volume: volume * 0.01,
    };

    mediaObject = new MediaObject(options);
    mediaObject.setPlayCallback(onMediaPlay);
    mediaObject.setPauseCallback(onMediaPause);
    mediaObject.setStopCallback(onMediaStop);
    mediaObject.setEndedCallback(onMediaEnded);
    mediaObject.setTickCallback(onMediaTick);
    containerS.appendChild(mediaObject.getMedia());
}

function onMediaPlay() {}

function onMediaPause() {}

function onMediaStop() {}

function onMediaEnded() {
}

function onMediaTick() {
    let time = mediaObject.getCurrentTime();

    if (isOneScriptOnly) {
        let items = scriptItems.filter((item) => item.classList.contains('on'));

        if (items.length > 0) {
            items.forEach((item) => {
                if (item.getAttribute('data-end') < time) {
                    item.classList.remove('on');
                    mediaObject.stop();
                    isOneScriptOnly = false;
                }
            });
        }
    } else {
        scriptItems.forEach((item) => {
            if (item.getAttribute('data-start') < time && item.getAttribute('data-end') > time) {
                item.classList.add('on');
            } else {
                item.classList.remove('on');
            }
        });
    }
}

function onSpeakerBtnClick(e) {
    if (!mediaObject) {
        return;
    }
    showDimmedOverlay();
    document.querySelectorAll('.stc-btn').forEach(button => {
        button.classList.remove('on')
    })
}

function onPopupCloseBtnClick(e) {
    hideDimmedOverlay();
}

function onListenBtnClick(e) {
    if (!recorderManager) {
        return;
    }

    if (recorderManager.isPlaying()) {
        recorderManager.stop();
    } else {
        recorderManager.play();
    }

}

function onSubmitBtnClick(e) {
    if (!recorderManager) {
        return;
    }
    submitChkEvent(true);
}


function onSpeakButtonClick(e) {
    let audio = e.currentTarget.getAttribute('data-audio');
    document.querySelectorAll('.stc-btn').forEach(button => {
        button.classList.remove('on')
    })
    if (audio) {
        e.currentTarget.classList.add('on');
        mediaObject.setSource(audio);
        mediaObject.play();
        audioEndChk();
    }
}
function audioEndChk(){
    aud = document.querySelector('audio');
    aud.onended = function() {
        document.querySelectorAll('.stc-btn').forEach(button => {
            button.classList.remove('on');
        })
    };
}
function clickInit(data){
    let h = `<div class="item"><button type='button' class="btn_sound stc-btn" data-audio="${data.items.audio}"><i class="fas fa-volume-up"></i></button><span class="text">${data.items.text}</span></div>`;
    document.querySelector('.stc_area').innerHTML = h;
    // document.querySelector('.stc-btn').addEventListener('click', onSpeakButtonClick)
    document.querySelectorAll('.stc-btn').forEach(el => {
        el.addEventListener('click', onSpeakButtonClick)
    });
}
window.addEventListener('DOMContentLoaded', function () {
    containerS = document.getElementById('container');
    audioPlayBtn = document.querySelector('.btn-pop.stc_play');
    contentArea = document.querySelector('.stc_area');
    document.querySelectorAll('.ap_inner .ap_close').forEach((button) => {
        button.addEventListener('click', onPopupCloseBtnClick);
    });
    let html = ''
    stcData.items.forEach(item => {
        html += `<div class="item"><div class="align-center"><button type='button' class="btn_sound stc-btn" data-audio="${item.audio}"><i class="fas fa-volume-up"></i></button><span class="text">${item.text}</span></div><button type="button" class="btn-pop rec" lang="y">녹음하기</button></div>`;
    });
    if(audioPlayBtn){
        audioPlayBtn.addEventListener('click', onSpeakerBtnClick);
    }

    document.querySelectorAll('.stc_area').forEach(area => {
        area.innerHTML = html;
    })
    document.querySelectorAll('.stc-btn').forEach(button => {
        button.addEventListener('click', onSpeakButtonClick)
    })

    initMediaObject();
});

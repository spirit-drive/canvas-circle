(function () {'use strict';
    const SLIDER = document.getElementById('management__slider');
    const RUNNER = document.getElementById('management__runner');
    const PRECISE_CONTROL = document.getElementById('management__precise-control');
    const SLIDER_START_TEXT = document.getElementById('management__start').children[1];
    const SLIDER_FINISH_TEXT = document.getElementById('management__finish').children[1];
    const HALF_RUNNER = RUNNER.offsetWidth / 2;
    const SLIDER_MIN = 1;
    const SLIDER_MAX = 100;
    const SLIDER_DEFAULT = 50;
    const SLIDER_WIDTH = SLIDER.offsetWidth;
    SLIDER_START_TEXT.textContent = SLIDER_MIN;
    SLIDER_FINISH_TEXT.textContent = SLIDER_MAX;

    // Положение бегунка
    let posRunner = e =>{
        let pos = e.pageX - SLIDER.offsetLeft - HALF_RUNNER;
        return (pos < -HALF_RUNNER)
                    ? -HALF_RUNNER
                    :(pos > SLIDER_WIDTH - HALF_RUNNER)
                        ? SLIDER_WIDTH - HALF_RUNNER
                        : pos;

    };
    // Значение слайдера по положению бегунка orientation = true и положение бегулка по значению слайдера orientation = false
    let valueSlider = (val,orientation = true) =>{
        return orientation
                    ? Math.round((val + HALF_RUNNER)*(SLIDER_MAX - SLIDER_MIN) / (SLIDER_WIDTH ) + 1)
                    : ((val-1)*SLIDER_WIDTH/(SLIDER_MAX - SLIDER_MIN)) - HALF_RUNNER;
    }
// Параметры слайдера, которые исполняются много раз
    let sliderParams = pos =>{
        RUNNER.style.left = pos + 'px';
        PRECISE_CONTROL.value = valueSlider(pos);
    }
// Выставляем по дефолту
    sliderParams(valueSlider(SLIDER_DEFAULT,false));
// Управление слайдера мышкой
    SLIDER.onmousedown = function (e) {
        sliderParams(posRunner(e));
        document.onmousemove = function (c) {
            sliderParams(posRunner(c));
            console.log(posRunner(c),valueSlider(posRunner(c)),SLIDER_WIDTH);
        }
        document.onmouseup = function () {
            document.onmousedown = document.onmousemove = null;
        };
    };
// Управление слайдера текстовым полем
    PRECISE_CONTROL.onkeyup = function () {
        setTimeout(function () {
            if(PRECISE_CONTROL.value > SLIDER_MAX){
                sliderParams(valueSlider(SLIDER_MAX,false));
            } else if (PRECISE_CONTROL.value < SLIDER_MIN){
                sliderParams(valueSlider(SLIDER_MIN,false));
            } else {
                RUNNER.style.left = valueSlider(PRECISE_CONTROL.value, false) + 'px';
            }
        },1000);
    };

}());
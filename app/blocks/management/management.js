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
    let sliderWidth = SLIDER.offsetWidth;
    SLIDER_START_TEXT.textContent = SLIDER_MIN;
    SLIDER_FINISH_TEXT.textContent = SLIDER_MAX;
    // Положение бегунка
    let posRunner = e =>{
        let pos = e.pageX - SLIDER.offsetLeft - HALF_RUNNER;
        return (pos < -HALF_RUNNER)
                    ? -HALF_RUNNER
                    :(pos > sliderWidth - HALF_RUNNER)
                        ? sliderWidth - HALF_RUNNER
                        : pos;
    };
    // Значение слайдера по положению бегунка orientation = true и положение бегулка по значению слайдера orientation = false
    let valueSlider = (val,orientation = true) =>{
        return orientation
                    ? Math.round((val + HALF_RUNNER)*(SLIDER_MAX - SLIDER_MIN) / (sliderWidth ) + 1)
                    : ((val-1)*sliderWidth/(SLIDER_MAX - SLIDER_MIN)) - HALF_RUNNER;
    }
// Параметры слайдера, которые исполняются много раз
    let sliderParams = (pos,val) =>{
        RUNNER.style.left = pos + 'px';
        (!!val)
            ? PRECISE_CONTROL.value = val
            : PRECISE_CONTROL.value = valueSlider(pos);
    }
// Помощник слайдера
    let helperSliderParams = (val,variant = false)=>{
        sliderParams(valueSlider(val,variant),val);
    }
// Выставляем по дефолту
    helperSliderParams(SLIDER_DEFAULT);
// Управление слайдера мышкой
    SLIDER.onmousedown = function (e) {
        sliderParams(posRunner(e));
        document.onmousemove = function (c) {
            sliderParams(posRunner(c));
        }
        document.onmouseup = function () {
            document.onmousedown = document.onmousemove = null;
        };
    };
// Управление слайдера текстовым полем
    PRECISE_CONTROL.onkeyup = function () {
        setTimeout(function () {
            (PRECISE_CONTROL.value > SLIDER_MAX)
                ? helperSliderParams(SLIDER_MAX)
                : (PRECISE_CONTROL.value < SLIDER_MIN)
                    ? helperSliderParams(SLIDER_MIN)
                    : RUNNER.style.left = valueSlider(PRECISE_CONTROL.value, false) + 'px';
        },1000);
    };
    // При изменении окна
    window.onresize = function () {
        // Минимум, максимум и положение бегунка вычисляется
        sliderWidth = SLIDER.offsetWidth;
        helperSliderParams(PRECISE_CONTROL.value);
    };

}());
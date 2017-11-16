function slider() {
    const SLIDER = document.getElementById('management__slider');
    const RUNNER = document.getElementById('management__runner');
    const SLIDER_INPUT = document.getElementById('management__precise-control');
    const SLIDER_START_TEXT = document.getElementById('management__start').children[1];
    const SLIDER_FINISH_TEXT = document.getElementById('management__finish').children[1];
    const HALF_RUNNER = RUNNER.offsetWidth / 2;
    const SLIDER_MIN = 1;
    const SLIDER_MAX = 100;
    const SLIDER_DEFAULT = 50;
    let sliderWidth = SLIDER.offsetWidth;
    SLIDER_START_TEXT.textContent = SLIDER_MIN;
    SLIDER_FINISH_TEXT.textContent = SLIDER_MAX;

// Куда поставить бегунок. Возвращает численное значение left
    let runnerLeft = e => {
        return e.pageX - SLIDER.offsetLeft - HALF_RUNNER;
    };

// Значение слайдера по положению бегунка orientation = true и положение бегулка по значению слайдера orientation = false
    let valueSlider = (val,orientation = true) =>{
        return orientation
                    ? Math.round((val + HALF_RUNNER)*(SLIDER_MAX - SLIDER_MIN) / sliderWidth + SLIDER_MIN)
                    : (val - SLIDER_MIN)*sliderWidth / (SLIDER_MAX - SLIDER_MIN) - HALF_RUNNER;
    }
// Ограничивает значение в заданом диапазоне и возвращает значение
    let limiter = (val,min,max) =>{
        return (val > max)
                    ? max
                    : (val < min)
                        ? min
                        : val;
    }

// left принимает числовое значение и устанавливает left бегунка, так же по нему находится числовое значение input.
// val числовое значение слайдера, если оно не объявлено, функция сама вычисляет его и устанавливает в input
    let sliderParams = (left,val) =>{
        left = limiter(left,-HALF_RUNNER,sliderWidth - HALF_RUNNER);
        RUNNER.style.left = `${left}px`;
        (!!val)
            ? SLIDER_INPUT.value = val
            : SLIDER_INPUT.value = valueSlider(left);
    }

// Принимает числовое значение слайдера, выставляет бегунок в соответсвии со значением
    let runnerAtValue = (val,variant = false)=>{
        sliderParams(valueSlider(val,variant),val);
    };

// Выставляет бегунок по дефолту
    runnerAtValue(limiter(SLIDER_DEFAULT,SLIDER_MIN,SLIDER_MAX));

// Управление слайдера мышкой
    SLIDER.onmousedown = function (e) {
        sliderParams(runnerLeft(e));
        document.onmousemove = function (c) {
            sliderParams(runnerLeft(c));
        };
        document.onmouseup = function () {
            document.onmousedown = document.onmousemove = null;
        };
    };

// Управление слайдера текстовым полем
    SLIDER_INPUT.onkeyup = function () {
        setTimeout(function () {
            let helper = limiter(SLIDER_INPUT.value,SLIDER_MIN,SLIDER_MAX);
            if (helper === SLIDER_MAX){
                runnerAtValue(SLIDER_MAX);
            }else if(helper === SLIDER_MIN){
                runnerAtValue(SLIDER_MIN);
            }
            RUNNER.style.left = `${valueSlider(helper, false)}px`;
        },1000);
    };

// При изменении окна
    window.onresize = function () {
        // Минимум, максимум и положение бегунка вычисляется
        sliderWidth = SLIDER.offsetWidth;
        runnerAtValue(SLIDER_INPUT.value);
    };

// При фокусе на бегунке, можем двигать его стрелками
    RUNNER.onfocus = function () {
        const STEP = sliderWidth/(SLIDER_MAX - SLIDER_MIN);
        let speedup = 0;
    // Для вычисления left
        let posRun = () =>{
            return this.style.left.match(/^-?\d+/)[0];
        };
    // Добавляет ускорение, принимает направление движения
        let moveKeyboard = speed =>{
            speedup += speed;
            this.style.left = `${sliderParams(Number(posRun()) + speedup*STEP)}px`;
        };
        this.onkeydown = function (e) {
            switch (e.keyCode) {
                case 37:
                    moveKeyboard(-1);
                    break;
                case 39:
                    moveKeyboard(1);
                    break;
            }
        };
    // Обнуляет ускорение
        this.onkeyup = function () {
            speedup = 0;
        };

    };

    return {
        val: SLIDER_INPUT.value,
    };

};
slider();
// Модель слайдера
let Slider = function (field, runner, min, max, sDefault, valuesElem, labelStart, labelFinish){
    const HALF_RUNNER = runner.offsetWidth / 2;

    // Ограничивает значение в заданом диапазоне и возвращает значение
    this.limiter = function (value,min,max) {
        return (value > max) ? max
            : (value < min) ? min
                : value;
    };

    // Функция для правильной загрузки
    this.start = function () {
        if(!!labelStart){labelStart.textContent = min;}
        if(!!labelFinish){labelFinish.textContent = max;}
        this.runnerAtValue(this.limiter(sDefault,min,max));
    };

    // Куда поставить бегунок при клике мышью. Возвращает численное значение left
    this.runnerLeft = function (e) {
        return e.pageX - field.offsetLeft - HALF_RUNNER;
    };

    // Принимает числовое значение слайдера, выставляет бегунок в соответсвии со значением
    this.runnerAtValue = function(value, variant = false){
        this.sliderParams(this.valueSlider(value, variant), value);
    };

    // Значение слайдера по положению бегунка orientation = true и положение бегулка по значению слайдера orientation = false
    this.valueSlider = function (value,orientation = true) {
        return orientation ? Math.round((value + HALF_RUNNER)*(max - min) / field.offsetWidth + min)
            : (value - min)*field.offsetWidth / (max - min) - HALF_RUNNER;
    };

    // Устанавливает отступ бегунка и значение input
    // left принимает числовое значение и устанавливает left бегунка, так же по нему находится числовое значение input.
    // val числовое значение слайдера, если оно не объявлено, функция сама вычисляет его и устанавливает в input
    this.sliderParams = function (left,value) {
        left = this.limiter(left,-HALF_RUNNER,field.offsetWidth - HALF_RUNNER);
        runner.style.left = `${left}px`;
        (!!value) ? valuesElem.value = value
            : valuesElem.value = this.valueSlider(left);
    };

    // Обновляет слайдер. Проверяет на ограничения и устанавливает значение и бегунок
    this.update = function () {
        let helper = this.limiter(valuesElem.value,min,max);
        if (helper === max){
            this.runnerAtValue(max);
        }else if(helper === min){
            this.runnerAtValue(min);
        }
        runner.style.left = `${this.valueSlider(helper, false)}px`;
    };

    // Движение бегунка с принятой скоростью
    this.moveKeyboard = function (speed) {
        const STEP = field.offsetWidth / (max - min);
        runner.style.left = `${this.sliderParams(runner.offsetLeft + speed * STEP)}px`;
    };

    // Возвращает значение слайдера
    this.value = function(){
        return valuesElem.value;
    };
    // Запускается при работе с бегунком runner и текстовым полем valuesElem
    this.play = function () {
        console.log('Присвойте slider.play функцию, которую вы хотите таким образом: slider.play = function () { ... Ваша функция ... }');
    };

    // При изменении окна, положение бегунка соответствует значению слайдера
    this.windowOnResize = function () {
        this.runnerAtValue(valuesElem.value);
    };

    let sliderContext = this;

    // Управление слайдера мышкой
    field.onmousedown = function (e) {
        sliderContext.sliderParams(sliderContext.runnerLeft(e));
        document.onmousemove = function (c) {
            sliderContext.sliderParams(sliderContext.runnerLeft(c));
        };
        document.onmouseup = function () {
            document.onmousedown = document.onmousemove = null;
        };
    };

    // Управление слайдера текстовым полем
    valuesElem.onfocus = function () {
        // Вспомогательные переменные для движения бегунка с ускорением
        let speed = 0, vector;

        // Отпускание клавиш
        this.onkeyup = function (e) {

            // Удаляем все кроме цифр
            this.value = this.value.replace(/\D/g, '');

            // Если enter, то срабатывает моментально
            switch (e.keyCode) {
                case 13:
                    sliderContext.update();
                    sliderContext.play();
                    break;
            }

            // По дефолту делает задержку для удобства
            setTimeout(function () {
                sliderContext.update();
            }, 1000);
            speed = 0;
        };

        // Нажатие клавиш
        this.onkeydown = function (e) {
            switch (e.keyCode) {
                case 40:
                    vector = -1;
                    speed += vector;
                    sliderContext.moveKeyboard(speed);
                    break;
                case 38:
                    vector = 1;
                    speed += vector;
                    sliderContext.moveKeyboard(speed);
                    break;
            }
        };

    };
    // При фокусе на бегунке, можем двигать его стрелками и запускать с помощью
    runner.onfocus = function () {
        let speed = 0, vector;
        this.onkeydown = function (e) {
            switch (e.keyCode) {
                case 37:
                case 40:
                    vector = -1;
                    speed += vector;
                    sliderContext.moveKeyboard(speed);
                    break;
                case 38:
                case 39:
                    vector = 1;
                    speed += vector;
                    sliderContext.moveKeyboard(speed);
                    break;
                case 13:
                    sliderContext.play();
                    break;
            }
        };
        // Обнуляет ускорение
        this.onkeyup = function () {
            speed = 0;
        };
    };

};

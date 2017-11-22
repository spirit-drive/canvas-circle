"use strict";
(function (){
    const SLIDER = document.getElementById('management__slider');
    const RUNNER = document.getElementById('management__runner');
    const SLIDER_INPUT = document.getElementById('management__precise-control');
    const SLIDER_START_TEXT = document.getElementById('management__start').children[1];
    const SLIDER_FINISH_TEXT = document.getElementById('management__finish').children[1];

    const CANVAS = document.getElementById('canvas__field');
    const SUBMIT = document.getElementById('canvas__play');

    const SLIDER_MIN = 1;
    const SLIDER_MAX = 100;
    const SLIDER_DEFAULT = 5;

// Модели все подключаются из отдельных файлов

// Создаем элементы
    // Создаем новый слайдер
    let slider = new Slider(
        SLIDER,
        RUNNER,
        SLIDER_MIN,
        SLIDER_MAX,
        SLIDER_DEFAULT,
        SLIDER_INPUT,
        SLIDER_START_TEXT,
        SLIDER_FINISH_TEXT
    );

    // Создаем новый холст
    let canvas = new CanvasCreate(CANVAS);

    // Создаем новый рисунок на холсте
    canvas.draw = new CircleCreate(CANVAS,canvas);


// Блок управления
    // Привязываем количество кругов к значению слайдера
    canvas.draw.circle.getCountCircle = function () {
        return slider.value();
    };

    // Запуском слайдера активируем анимацию холста
    slider.play = function () {
        canvas.draw.animation.play();
    };

    // Анимацию на кнопку
    SUBMIT.addEventListener('click', function () {
        canvas.draw.animation.play();
    });

// Блок глобальных событий

    // Предварительная настройка
    canvas.size();
    slider.start();

    window.onresize = function () {
        slider.windowOnResize();
        canvas.size();
    };

}());
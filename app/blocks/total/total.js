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
    const SLIDER_DEFAULT = 1;

    // Функции для помощи. Решил не использовать данную нанобиблиотеку
    let support = {

        // Ограничивает значение в заданом диапазоне и возвращает значение
        limiter: function (value,min,max) {
            return (value > max) ? max
                : (value < min) ? min
                    : value;
        },

        // Целочисленный рандом
        randomInt: function(min, max){
            return Math.round(Math.random() * (max - min)) + min;
        },

        // Дистанция между двумя точками
        distance: function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
    };

    // Объект данного блока
    let block = {
        default: function () {
            canvas.size();
            slider.start();
        }
    };

// Модели
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

    // Модель холста
    let CanvasCreate = function(canvas){

        // Сохраняем контекст объекта
        let canvasObjContext = this;

        // Выставляет канвас на всю ширину родителя, средствами css канвас расстягивается
        this.size = function () {
            canvas.width = canvas.parentNode.offsetWidth; // БАГ! Ширина канвас увеличивается на ширину бегунка
            canvas.height = canvas.width * 0.62;
        };
        // В этой функции присваиваем все, что хотим нарисовать
        this.draw = function () {
            console.log('Присвойте функцию данному методу: canvas.draw = function(){... Ваша функция ...}');
        };
        this.interaction = {
            // Хранит координаты мыши
            mousePos: {
                x: 0,
                y: 0
            },
            mouseMove: function () {
                // При движении мышью, перезаписываем ее координаты
                canvas.onmousemove = function (e){
                    canvasObjContext.interaction.mousePos.x = e.pageX - canvas.offsetLeft;
                    canvasObjContext.interaction.mousePos.y = e.pageY - canvas.offsetTop;
                };
            },
        };
    };

    // Модель кругов и всей физики
    let CircleCreate = function (canvasElem,canvasObj) {
        const CONTEXT = canvasElem.getContext('2d');

        let $this = this;

        this.support = {
            // Целочисленный рандом
            randomInt: function(min, max){
                return Math.round(Math.random() * (max - min)) + min;
            },

            // Дистанция между двумя точками
            distance: function (x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            }
        };
        this.button = {
            // Массив кнопок
            buttons: [
                {
                    color: '#ffcb00',
                    text: 'Play',
                    textX: 22,
                    func: function () {
                        console.log(`Функция кнопки "${this.text}"`);
                        $this.animation.count = requestAnimationFrame($this.animation.loop);

                    },
                },
                {
                    color: '#33ccff',
                    text: 'Pause',
                    textX: 10,
                    func: function () {
                        console.log(`Функция кнопки "${this.text}"`);
                        cancelAnimationFrame($this.animation.count);
                    },
                },
            ],
            // Настройки кнопки
            setting: {
                width: 100,
                height: 40,
                lineWidth: 1,
                borderRadius: 10,
                shift: 10,
                colorStroke: '#f4f4f4',
                textColor: '#fafafa',
                textFontSize: 28,
            },
            // Модель кнопок
            Model: function (x,color,text,textX,func) {
                this.x = x;
                this.y = $this.button.setting.shift;
                this.radius = $this.button.setting.borderRadius;
                this.width = $this.button.setting.width;
                this.height = $this.button.setting.height;
                this.color = color;
                this.text = text;
                this.lineWidth = $this.button.setting.lineWidth;
                this.strokeStyle = $this.button.setting.colorStroke;
                this.textFontSize = $this.button.setting.textFontSize;
                this.fillStyle = $this.button.setting.textColor;
                this.func = func;
                this.draw = function () {
                    CONTEXT.beginPath();
                    CONTEXT.moveTo(this.x, this.y + this.radius);
                    CONTEXT.lineTo(this.x, this.y + this.height - this.radius);
                    CONTEXT.quadraticCurveTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height);
                    CONTEXT.lineTo(this.x + this.width - this.radius, this.y + this.height);
                    CONTEXT.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width, this.y + this.height - this.radius);
                    CONTEXT.lineTo(this.x + this.width, this.y + this.radius);
                    CONTEXT.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width - this.radius, this.y);
                    CONTEXT.lineTo(this.x + this.radius, this.y);
                    CONTEXT.quadraticCurveTo(this.x, this.y, this.x, this.y + this.radius);
                    CONTEXT.lineWidth = this.lineWidth;
                    CONTEXT.strokeStyle = this.strokeStyle;
                    CONTEXT.stroke();
                    CONTEXT.fillStyle = this.color;
                    CONTEXT.fill();
                    CONTEXT.font = `${this.textFontSize}px Arial`;
                    CONTEXT.beginPath();
                    CONTEXT.fillStyle = this.fillStyle;
                    CONTEXT.fillText(this.text,this.x + textX,$this.button.setting.shift/2 - 2 + ((this.width - this.textFontSize)/2));
                    CONTEXT.fill();
                };
            },
            // Создание кнопок
            array: [],
            create: function () {
                this.array = [];
                for (let i = 0; i < $this.button.buttons.length; i++) {
                    this.array.push(new this.Model(
                        $this.button.setting.shift*(i+1) + $this.button.setting.width * i,
                        $this.button.buttons[i].color,
                        $this.button.buttons[i].text,
                        $this.button.buttons[i].textX,
                        $this.button.buttons[i].func
                    ));
                }
            },
            // Функции на кнопки
            buttonFunc: function (mouseX,mouseY) {
                for (let i = 0; i < $this.button.array.length; i++){
                    if (mouseX >= $this.button.array[i].x &&
                        mouseX <= $this.button.array[i].x + $this.button.array[i].width &&
                        mouseY >= $this.button.array[i].y &&
                        mouseY <= $this.button.array[i].y + $this.button.array[i].height)
                    {
                        canvasElem.style.cursor = 'pointer';
                        return $this.button.array[i];
                    }
                }
            },
            // Отрисовка всех кнопок
            draw: function () {
                for (let i = 0; i < this.array.length; i++){
                    this.array[i].draw();
                }
                this.buttonFunc(canvasObj.interaction.mousePos.x,canvasObj.interaction.mousePos.y);
            },

        };
        this.circle = {
            // Количество кругов по умолчанию
            countCircle: 50,
            // Функция для привязки количества кругов к другой функции
            getCountCircle: function () {
                console.log(
                    `По умолчанию рисует ${this.countCircle} кругов 
                    \nЧтобы изменять количество кругов напишите: 
                    \nYourObject.getCountCircle = function () {... Ваша функция ...} 
                    \nНапример: canvas.draw.circle.getCountCircle = function () {... Ваша функция ...}`
                );
                return this.countCircle;
            },
            // Настройки
            setting: {
                speed: 14,
                color: [
                    "#bfdefe",
                    "#8fcafe",
                    "#dbcdf0",
                ],
                colorStop: "#ffb584",
                colorPlay: "#fd0",
                densityCircle: [15, 20, 25],
            },
            // Модель
            Model: function () {
                // Рандомный вид
                let kind = $this.support.randomInt(0, 2);

                // Размеры
                this.radius = (Math.random() + 1) * Math.sqrt(canvasElem.height * canvasElem.width / $this.circle.getCountCircle()) / 2 * 0.3;
                this.lineWidth = 5;
                this.totalRadius = this.radius + this.lineWidth;

                // Позиция
                this.x = Math.random() * (canvasElem.width - this.radius * 2) + this.radius;
                this.y = Math.random() * (canvasElem.height - this.radius * 2) + this.radius;

                // Цвета
                this.color = $this.circle.setting.color[kind];
                this.strokeStyle = this.color;

                // Физические параметры
                this.volumeCircle = Math.pow(this.radius, 3) * Math.PI * 4 / 3;
                this.mass = this.volumeCircle * $this.circle.setting.densityCircle[kind];
                this.vector = {
                    x: $this.circle.setting.speed * (Math.random() - 0.5),
                    y: $this.circle.setting.speed * (Math.random() - 0.5),
                };

                // Движение
                this.move = function () {
                    this.limiter();
                    this.x += this.vector.x;
                    this.y += this.vector.y;
                };

                // При соударении о стенки, отлетает обратно
                this.limiter = function () {
                    let canvasRightEdge = canvasElem.width;
                    let canvasLeftEdge = 0;
                    let canvasTopEdge = 0;
                    let canvasBottomEdge = canvasElem.height;
                    let circleRightEdge = this.x + this.totalRadius;
                    let circleLeftEdge = this.x - this.totalRadius;
                    let circleTopEdge = this.y - this.totalRadius;
                    let circleBottomEdge = this.y + this.totalRadius;

                    // Выдавливание из-за краев
                    let squeezing =(edge1,edge2)=>{
                        let squeeze = 1;
                        return (edge1 <= edge2)? squeeze : -squeeze;
                    };

                    // По ширине
                    if (circleRightEdge >= canvasRightEdge || circleLeftEdge <= canvasLeftEdge) {
                        this.vector.x = -this.vector.x;
                        this.x += squeezing(circleLeftEdge,canvasLeftEdge);
                    }

                    // По высоте
                    if (circleTopEdge <= canvasTopEdge || circleBottomEdge >= canvasBottomEdge) {
                        this.vector.y = -this.vector.y;
                        this.y += squeezing(circleTopEdge,canvasTopEdge);
                    }
                };

                // Отрисовка
                this.draw = function () {
                    CONTEXT.beginPath();
                    CONTEXT.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    CONTEXT.closePath();
                    CONTEXT.lineWidth = this.lineWidth;
                    CONTEXT.strokeStyle = this.strokeStyle;
                    CONTEXT.stroke();
                    CONTEXT.fillStyle = this.color;
                    CONTEXT.fill();
                };
            },
            // Создание кругов
            array: [],
            create: function () {
                this.array = [];
                for (let i = 0; i < $this.circle.getCountCircle(); i++) {
                    this.array.push(new this.Model());
                }
            },
            // Физика
            physics: {
            // Содержит пары, которые столкнулись, чтобы не вызывать столкновение, до тех пор, пока они окончательно не выйдут друг из друга
            isWasPair: [],

            // Для выхода из итерации
            check: false,


            // Принимает номера кругов, если есть пара с такими номерами, то либо удаляет "this.isWasPair.splice(l)" - variant = false,
            // либо присваивает переменной значение для выхода из итерации "this.check = true" - variant = true
            checkPair: function (i,j,variant = false) {
                for (let l = 0; l < this.isWasPair.length; l++){
                    if (this.isWasPair[l][0] === i && this.isWasPair[l][1] === j){
                        (variant) ? this.check = true : this.isWasPair.splice(l);
                        break;// Текущая пара j, i найдена, останавливаем цикл
                    }
                }
            },

            // Возвращает вектор в соответствии с законом сохранения энергии
            law: function (vector1,vector2,mass1,mass2,variant) {
                return (variant) ? vector1 / (mass1 + mass2) * (2 * mass1) + vector2 / (mass1 + mass2) * (mass2 - mass1)
                    : vector1 / (mass1 + mass2) * (mass1 - mass2) + vector2 / (mass1 + mass2) * (2 * mass2);
            },

            // Устанавливает значения вектора обоим шарам
            calculation: function (array,vX1,vX2,vY1,vY2,m1,m2) {
                for (let k = 0; k < array.length; k++){
                    $this.circle.array[array[k]].vector.x = this.law(vX1,vX2,m1,m2,k);
                    $this.circle.array[array[k]].vector.y = this.law(vY1,vY2,m1,m2,k);
                }
            },

            // Основная функция
            func: function () {

                // Переменные объявляем вначале, а не цикле, чтобы не забивать память
                let minDistance, distance;

                // Проверяем каждый, кроме последнего, последнего "i < $this.circle.array.length - 1",
                // сравниваем только со следующими после того, которого брали i
                for (let i = 0; i < $this.circle.array.length - 1; i++) {
                    for (let j = i + 1; j < $this.circle.array.length; j++) {

                        this.check = false; // Для проверки пары

                        // Необходимые параметры
                        minDistance = $this.circle.array[i].radius + $this.circle.array[j].radius;
                        distance = $this.support.distance($this.circle.array[i].x, $this.circle.array[i].y, $this.circle.array[j].x, $this.circle.array[j].y);

                        if (distance <= minDistance) {

                            // Просматриваем все пары, если там есть текущая пара, то ...
                            this.checkPair(i, j, true);
                            // ... то выходим из итерации (берем другую пару)
                            if(this.check){continue;}

                            // Отправляем значения в калькулятор
                            this.calculation(
                                [i, j],// !Внимание! Важна последовательность! Сначала i, потом j
                                $this.circle.array[i].vector.x,
                                $this.circle.array[j].vector.x,
                                $this.circle.array[i].vector.y,
                                $this.circle.array[j].vector.y,
                                $this.circle.array[i].mass,
                                $this.circle.array[j].mass
                            );

                            // Записываем эту пару, чтобы потом не вызывать взаимодействие
                            this.isWasPair.push([i, j]);

                        } else {
                            // Если дистанция больше минимальной, надо удалить записи о парах, которые уже не актуальны
                            this.checkPair(i, j);
                        }
                    }
                }
            },
            stopStartCircle: function () {
                // При нажатии проверяет, попал ли на круг, если попал то останавливает, либо запускает его
                let k = 0.2;
                if ($this.circle.array.length){
                    for (let i = 0; i < $this.circle.array.length; i++){
                        if ($this.support.distance(canvasObj.interaction.mousePos.x,canvasObj.interaction.mousePos.y,$this.circle.array[i].x,$this.circle.array[i].y) < $this.circle.array[i].totalRadius){
                            if ($this.circle.array[i].vector.x){
                                $this.circle.array[i].vector.x = 0;
                                $this.circle.array[i].vector.y = 0;
                                $this.circle.array[i].strokeStyle = $this.circle.setting.colorStop;
                            } else {
                                $this.circle.array[i].vector.x = (canvasObj.interaction.mousePos.x - $this.circle.array[i].x)*k;
                                $this.circle.array[i].vector.y = (canvasObj.interaction.mousePos.y - $this.circle.array[i].y)*k;
                                $this.circle.array[i].strokeStyle = $this.circle.setting.colorPlay;
                            }
                            setTimeout(function () {
                                $this.circle.array[i].strokeStyle = $this.circle.array[i].color;
                            },1000);
                        }
                    }
                }
            },
        },
            // Отрисовка
            draw: function () {
                // Бежим по массиву с кругами
                for (let i = 0; i < $this.circle.array.length; i++) {
                    // Сдвигаем и рисуем круг
                    $this.circle.array[i].move();
                    $this.circle.array[i].draw();

                    // Если курсор на круге, то выставляем ему значение pointer
                    if ($this.support.distance(canvasObj.interaction.mousePos.x,canvasObj.interaction.mousePos.y,$this.circle.array[i].x,$this.circle.array[i].y) < $this.circle.array[i].totalRadius){
                        canvasElem.style.cursor = 'pointer';
                    }
                }
                $this.circle.physics.func();
            },
        };
        this.createAll = function () {
            $this.circle.create();
            $this.button.create();
        };
        this.drawAll = function () {
            // Очищаем холст
            CONTEXT.clearRect(0, 0, canvasElem.width, canvasElem.height);

            // Рисуем все элементы
            $this.circle.draw();
            $this.button.draw();
        };
        this.animation = {
            count:'',
            // Петля анимации
            loop: function() {
                // При нажатии на SUBMIT с каждым нажатием скорость кругов увеличивается, cancelAnimationFrame предотвращает эту проблему
                cancelAnimationFrame($this.animation.count);
                $this.drawAll();
                $this.animation.count = requestAnimationFrame($this.animation.loop);
            },
            play: function () {
                $this.createAll();
                $this.drawAll();
                $this.interaction();
            }
        };
        this.interaction = function () {
            let button;
            canvasObj.interaction.mouseMove();
            setInterval(function () {
                canvasElem.style.cursor = 'default';
                button = $this.button.buttonFunc(canvasObj.interaction.mousePos.x,canvasObj.interaction.mousePos.y);
                canvasElem.onmousedown = function () {
                    if (button){button.func();}
                    $this.circle.physics.stopStartCircle();
                };
            },20);
        };

    };

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
    block.default();

    window.onresize = function () {
        slider.windowOnResize();
        canvas.size();
    };

}());
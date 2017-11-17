(function (){
    const SLIDER = document.getElementById('management__slider');
    const RUNNER = document.getElementById('management__runner');
    const SLIDER_INPUT = document.getElementById('management__precise-control');
    const SLIDER_START_TEXT = document.getElementById('management__start').children[1];
    const SLIDER_FINISH_TEXT = document.getElementById('management__finish').children[1];
    const CANVAS = document.getElementById('canvas__field');
    const SUBMIT = document.getElementById('canvas__play');
    const CONTEXT = CANVAS.getContext('2d');
    const HALF_RUNNER = RUNNER.offsetWidth / 2;
    const SLIDER_MIN = 1;
    const SLIDER_MAX = 100;
    const SLIDER_DEFAULT = 100;

    let support = {

        // Ограничивает значение в заданом диапазоне и возвращает значение
        limiter: function (value,min,max) {
            return (value > max)
                ? max
                : (value < min)
                    ? min
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

    let block = {
        default: function () {
            canvas.size();
            slider.default();
        }
    };

    let canvas = {
        // Выставляет канвас на всю ширину родителя, средствами css канвас расстягивается
        size: function () {
            CANVAS.width = CANVAS.parentNode.offsetWidth - 2*HALF_RUNNER; // БАГ! Ширина канвас увеличивается на ширину бегунка
            CANVAS.height = CANVAS.width * 0.62;
        }
    };

    let slider = {
        default: function () {
            SLIDER_START_TEXT.textContent = SLIDER_MIN;
            SLIDER_FINISH_TEXT.textContent = SLIDER_MAX;
            this.runnerAtValue(support.limiter(SLIDER_DEFAULT,SLIDER_MIN,SLIDER_MAX));
        },

        // Куда поставить бегунок. Возвращает численное значение left
        runnerLeft: function (e) {
            return e.pageX - SLIDER.offsetLeft - HALF_RUNNER;
        },

        // Принимает числовое значение слайдера, выставляет бегунок в соответсвии со значением
        runnerAtValue: (value, variant = false)=>{
            slider.sliderParams(slider.valueSlider(value, variant), value);
        },

        // Значение слайдера по положению бегунка orientation = true и положение бегулка по значению слайдера orientation = false
        valueSlider: function (value,orientation = true) {
                return orientation
                    ? Math.round((value + HALF_RUNNER)*(SLIDER_MAX - SLIDER_MIN) / SLIDER.offsetWidth + SLIDER_MIN)
                    : (value - SLIDER_MIN)*SLIDER.offsetWidth / (SLIDER_MAX - SLIDER_MIN) - HALF_RUNNER;
        },

        // Устанавливает отступ бегунка и значение input
        // left принимает числовое значение и устанавливает left бегунка, так же по нему находится числовое значение input.
        // val числовое значение слайдера, если оно не объявлено, функция сама вычисляет его и устанавливает в input
        sliderParams: function (left,value) {
                left = support.limiter(left,-HALF_RUNNER,SLIDER.offsetWidth - HALF_RUNNER);
                RUNNER.style.left = `${left}px`;
                (!!value)
                    ? SLIDER_INPUT.value = value
                    : SLIDER_INPUT.value = this.valueSlider(left);
        },

        // Обновляет слайдер. Проверяет на ограничения и устанавливает значение и бегунок
        update: function () {
            let helper = support.limiter(SLIDER_INPUT.value,SLIDER_MIN,SLIDER_MAX);
            if (helper === SLIDER_MAX){
                slider.runnerAtValue(SLIDER_MAX);
            }else if(helper === SLIDER_MIN){
                slider.runnerAtValue(SLIDER_MIN);
            }
            RUNNER.style.left = `${slider.valueSlider(helper, false)}px`;
        },

        // Движение бегунка с принятой скоростью
        moveKeyboard: function (speed) {
            const STEP = SLIDER.offsetWidth / (SLIDER_MAX - SLIDER_MIN);
            RUNNER.style.left = `${slider.sliderParams(RUNNER.offsetLeft + speed * STEP)}px`;
        },
    };

// Канвас начало

    // Круги
    let circle = {
        // Настройки
        setting: {
            speed: 7,
            color: [
                "#bfdefe",
                "#8fcafe",
                "#dbcdf0",
            ],
            densityCircle: [10, 30, 50],
        },
        // Модель
        Model: function () {
            // Рандомный вид
            let kind = support.randomInt(0, 2);

            // Размеры
            this.radius = (Math.random() + 1) * Math.sqrt(CANVAS.height * CANVAS.width / SLIDER_INPUT.value) / 2 * 0.3;
            this.lineWidth = this.radius * 0.1;
            this.totalRadius = this.radius + this.lineWidth;

            // Позиция
            this.x = Math.random() * (CANVAS.width - this.radius * 2) + this.radius;
            this.y = Math.random() * (CANVAS.height - this.radius * 2) + this.radius;

            // Цвета
            this.color = circle.setting.color[kind];
            this.strokeStyle = this.color;

            // Физические параметры
            this.volumeCircle = Math.pow(this.radius, 3) * Math.PI * 4 / 3;
            this.mass = this.volumeCircle * circle.setting.densityCircle[kind];
            this.vector = {
                x: circle.setting.speed * (Math.random() - 0.5),
                y: circle.setting.speed * (Math.random() - 0.5),
            };

            // Движение
            this.move = function () {
                this.limiter();
                this.x += this.vector.x;
                this.y += this.vector.y;
                this.draw();
            };

            // При соударении о стенки, отлетает обратно
            this.limiter = function () {
                let canvasRightEdge = CANVAS.width;
                let canvasLeftEdge = 0;
                let canvasTopEdge = 0;
                let canvasBottomEdge = CANVAS.height;
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
        array: [],
        create: function () {
            this.array = [];
            for (let i = 0; i < SLIDER_INPUT.value; i++) {
                this.array.push(new this.Model());
            }
        }
    };

    // Физика
    let physics = {
        // Содержит пары, которые столкнулись, чтобы не вызывать столкновение, до тех пор, пока они окончательно не выйдут друг из друга
        isWasPair: [],

        // Для выхода из итерации
        check: false,

        // Принимает номера кругов, если есть пара с такими номерами, то либо удаляет "this.isWasPair.splice(l)",
        // либо присваивает переменной значение для выхода из итерации "this.check = true"
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
            return (variant)
                ? vector1 / (mass1 + mass2) * (mass1 - mass2) + vector2 / (mass1 + mass2) * (2 * mass2)
                : vector1 / (mass1 + mass2) * (2 * mass1) + vector2 / (mass1 + mass2) * (mass2 - mass1);
        },

        // Устанавливает значения вектора обоим шарам
        calculation: function (array,vX1,vX2,vY1,vY2,m1,m2) {
            for (let k = 0; k < array.length; k++){
                circle.array[array[k]].vector.x = this.law(vX1,vX2,m1,m2,k);
                circle.array[array[k]].vector.y = this.law(vY1,vY2,m1,m2,k);
            }
        },

        // Основная функция
        func: function () {

            // Переменные объявляем вначале, а не цикле, чтобы не забивать память
            let minDistance, distance;

            // Проверяем каждый, кроме последнего, последнего "i < circle.array.length - 1", но сравниваем с каждым "j < circle.array.length"
            for (let i = 0; i < circle.array.length - 1; i++) {
                for (let j = i + 1; j < circle.array.length; j++) {

                    this.check = false; // Для проверки пары

                    // Необходимые параметры
                    minDistance = circle.array[i].radius + circle.array[j].radius;
                    distance = support.distance(circle.array[i].x, circle.array[i].y, circle.array[j].x, circle.array[j].y);

                    if (distance <= minDistance) {

                        // Просматриваем все пары, если там есть текущая пара, то ...
                        this.checkPair(i, j, true);
                        // ... то выходим из итерации (берем другую пару)
                        if(this.check){continue;}

                        // Отправляем значения в калькулятор
                        this.calculation(
                            [j, i],// !ВАЖНО! Обратная последовательность! Сначала j, потом i иначе работать не будет
                            circle.array[i].vector.x,
                            circle.array[j].vector.x,
                            circle.array[i].vector.y,
                            circle.array[j].vector.y,
                            circle.array[i].mass,
                            circle.array[j].mass
                        );

                        // Записываем эту пару, чтобы потом не вызывать взаимодействие
                        this.isWasPair.push([i, j]);

                    } else {
                        // Если дистанция больше минимальной, надо удалить записи о парах, которые уже не актуальны
                        this.checkPair(i, j);
                    }
                }
            }
        }
    };

    // Анимации
    let anim;
    let animation = {
        // Петля анимации
        loop: function() {
            // При нажатии на SUBMIT с каждым нажатием скорость кругов увеличивается, cancelAnimationFrame предотвращает эту проблему
            cancelAnimationFrame(anim);
            CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
            for (let i = 0; i < circle.array.length; i++) {
                circle.array[i].move();
            }
            physics.func();
            anim = requestAnimationFrame(animation.loop);
        },
        play: function () {
            circle.create();
            anim = requestAnimationFrame(this.loop);
        }
    };

// Блок управления
    // Анимацию на кнопку
    SUBMIT.addEventListener('click', function () {
        animation.play();
    });

    // Управление слайдера мышкой
    SLIDER.onmousedown = function (e) {
        slider.sliderParams(slider.runnerLeft(e));
        document.onmousemove = function (c) {
            slider.sliderParams(slider.runnerLeft(c));
        };
        document.onmouseup = function () {
            document.onmousedown = document.onmousemove = null;
        };
    };

    // Управление слайдера текстовым полем
    SLIDER_INPUT.onkeyup = function (e) {

        // Если enter, то срабатывает моментально
        switch (e.keyCode) {
            case 13:
                slider.update();
                animation.play();
                break;
        }

        // По дефолту делает задержку для удобства
        setTimeout(function () {
            slider.update();
        },1000);
    };

    // При фокусе на бегунке, можем двигать его стрелками и запускать с помощью
    RUNNER.onfocus = function () {
        let speed = 0, vector;
        this.onkeydown = function (e) {
            switch (e.keyCode) {
                case 37:
                    vector = -1;
                    speed += vector;
                    slider.moveKeyboard(speed);
                    break;
                case 39:
                    vector = 1;
                    speed += vector;
                    slider.moveKeyboard(speed);
                    break;
                case 13:
                    animation.play();
                    break;
            }
        };
        // Обнуляет ускорение
        this.onkeyup = function () {
            speed = 0;
        };
    };

// Блок глобальных событий

    // Предварительная настройка
    block.default();

    window.onresize = function () {
        slider.runnerAtValue(SLIDER_INPUT.value);
        canvas.size();
    };
}());
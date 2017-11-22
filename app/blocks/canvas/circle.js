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
        buttonHover: function (mouseX,mouseY) {
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
            this.buttonHover(canvasObj.interaction.mousePos.x,canvasObj.interaction.mousePos.y);
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
        // Виды кругов
        kind: [
            {
                color: "#fdff41",
                colorStop: "#5880ff",
                colorPlay: "#30ffeb",
                radiusCoef: 0.5,
                densityCircle: 10
            },
            {
                color: "#ffc13f",
                colorStop: "#5880ff",
                colorPlay: "#30ffeb",
                radiusCoef: 0.7,
                densityCircle: 15
            },
            {
                color: "#bfdefe",
                densityCircle: 5
            },
            {
                color: "#8fcafe",
                densityCircle: 20
            },
            {
                color: "#dbcdf0",
                densityCircle: 45
            },
        ],
        // Настройки
        setting: {
            speed: 17,
            colorStop: "#ffb584",
            colorPlay: "#fd0",
            lineWidth: 5,
            radiusCoef: 1,
        },
        // Модель
        Model: function () {
            // Рандомный вид
            let kind = $this.support.randomInt(0, $this.circle.kind.length - 1);

            // Размеры
            this.radius = (Math.random() + 1) * Math.sqrt(canvasElem.height * canvasElem.width / $this.circle.getCountCircle()) / 2 * 0.3 * (($this.circle.kind[kind].radiusCoef)? $this.circle.kind[kind].radiusCoef : $this.circle.setting.radiusCoef);
            this.lineWidth = $this.circle.setting.lineWidth;
            this.totalRadius = this.radius + this.lineWidth;

            // Позиция
            this.x = Math.random() * (canvasElem.width - this.radius * 2) + this.radius;
            this.y = Math.random() * (canvasElem.height - this.radius * 2) + this.radius;

            // Цвета
            this.color = $this.circle.kind[kind].color;
            this.strokeStyle = this.color;
            this.colorStop = ($this.circle.kind[kind].colorStop)?$this.circle.kind[kind].colorStop:$this.circle.setting.colorStop;
            this.colorPlay = ($this.circle.kind[kind].colorPlay)?$this.circle.kind[kind].colorPlay:$this.circle.setting.colorPlay;

            // Физические параметры
            this.volumeCircle = Math.pow(this.radius, 3) * Math.PI * 4 / 3;
            this.mass = this.volumeCircle * $this.circle.kind[kind].densityCircle;
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
                                $this.circle.array[i].strokeStyle = $this.circle.array[i].colorStop;
                            } else {
                                $this.circle.array[i].vector.x = (canvasObj.interaction.mousePos.x - $this.circle.array[i].x)*k;
                                $this.circle.array[i].vector.y = (canvasObj.interaction.mousePos.y - $this.circle.array[i].y)*k;
                                $this.circle.array[i].strokeStyle = $this.circle.array[i].colorPlay;
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
                if ($this.support.distance(
                        canvasObj.interaction.mousePos.x,
                        canvasObj.interaction.mousePos.y,
                        $this.circle.array[i].x,
                        $this.circle.array[i].y
                    ) < $this.circle.array[i].totalRadius){
                    canvasElem.style.cursor = 'pointer';
                }
            }
            $this.circle.physics.func();
        },
    };
    // Создание всех элементов
    this.createAll = function () {
        $this.circle.create();
        $this.button.create();
    };
    // Отрисовка всех элементов
    this.drawAll = function () {
        canvasElem.style.cursor = 'default';

        // Очищаем холст
        CONTEXT.clearRect(0, 0, canvasElem.width, canvasElem.height);

        // Рисуем все элементы
        $this.circle.draw();
        $this.button.draw();
    };
    // Вся анимация
    this.animation = {
        count: 0,
        // Петля анимации
        loop: function() {
            // При нажатии на SUBMIT с каждым нажатием скорость кругов увеличивается, cancelAnimationFrame предотвращает эту проблему
            cancelAnimationFrame($this.animation.count);
            $this.drawAll();
            $this.interaction.func();
            $this.animation.count = requestAnimationFrame($this.animation.loop);
        },
        play: function () {
            $this.createAll();
            $this.drawAll();
            $this.interaction.on();
            $this.animation.count = requestAnimationFrame($this.animation.loop);
        }
    };
    // Взаимодействие с рисунками на холсте
    this.interaction = {
        on: function () {
            // Включаем функцию холста - отслеживание положения курсора на холсте
            canvasObj.interaction.mouseMove();
        },
        func: function () {
            let button;
            setInterval(function () {
                // button принимает кнопку, если на нее наведен курсор
                button = $this.button.buttonHover(canvasObj.interaction.mousePos.x, canvasObj.interaction.mousePos.y);
                canvasElem.onmousedown = function () {
                    // Курсор наведен и нажата мышь, то вызываем функцию принятой кнопки
                    if (button) {
                        button.func();
                    } else {
                        // Курсор не наведен ни на одну из кнопок, то при нажатии на холст взаимодействуем с кругами
                        $this.circle.physics.stopStartCircle();
                    }
                };
            },20);
        },
    };
};
(function () {
    const CANVAS = document.getElementById('canvas__field');
    const SUBMIT = document.getElementById('canvas__play');
    const CONTEXT = CANVAS.getContext('2d');
    const VALUE_SLIDER = slider().sliderValue;

// Выставляет канвас на всю ширину родителя, средствами css канвас расстягивается
    let setSizeCanvas = ()=>{
        CANVAS.width = CANVAS.parentNode.offsetWidth;
        CANVAS.height = CANVAS.width*0.62;
    };
    setSizeCanvas();

// Оказывается window.onresize не сработает, если в другой функции он уже вызван
    window.onresize = function () {
        setSizeCanvas();
    };

// Вспомогательная функция. Целочисленный рандом
    let randomInt = (min,max)=>{
        return Math.round(Math.random() * (max - min)) + min;
    };

// Блок создания кругов. Настройки и образ
    // Настройки
    let circleSettint = {
        speed: 7,
        color: [
            "#bfdefe",
            "#8fcafe",
            "#dbcdf0",
        ],
        densityCircle: [10,30,50],
    };

    // Образ
    Circle = function () {
        // Рандомный вид
        let kind = randomInt(0,2);

        // Размеры
        this.radius = (Math.random() + 1)*Math.sqrt(CANVAS.height * CANVAS.width / VALUE_SLIDER) / 2 * 0.1;
        this.lineWidth = 5;
        this.totalRadius = this.radius + this.lineWidth;

        // Позиция
        this.x = Math.random()*(CANVAS.width - this.radius*2) + this.radius;
        this.y = Math.random()*(CANVAS.height - this.radius*2) + this.radius;

        // Цвета
        this.color = circleSettint.color[kind];
        this.strokeStyle = this.color;

        // Физические параметры
        this.volumeCircle = Math.pow(this.radius,3)*Math.PI*4/3;
        this.mass = this.volumeCircle*circleSettint.densityCircle[kind];
        this.vector = {
            x: circleSettint.speed*(Math.random() - 0.5),
            y: circleSettint.speed*(Math.random() - 0.5),
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
            if (circleRightEdge >= canvasRightEdge || circleLeftEdge <= canvasLeftEdge){
                this.vector.x = -this.vector.x;
            }
            if (circleTopEdge <= canvasTopEdge || circleBottomEdge >= canvasBottomEdge){
                this.vector.y = -this.vector.y;
            }
        };

        // Отрисовка
        this.draw = function () {
            CONTEXT.beginPath();
            CONTEXT.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            CONTEXT.closePath();
            CONTEXT.lineWidth = this.lineWidth;
            CONTEXT.strokeStyle = this.strokeStyle;
            CONTEXT.stroke();
            CONTEXT.fillStyle = this.color;
            CONTEXT.fill();
        };
    };

// Создаем круги по образцу
    let circles = [];
    let createCircle = ()=>{
        circles = [];
        for (let i=0; i < VALUE_SLIDER; i++){
            circles.push(new Circle());
        }
    };

// Проверка дистанции между точками
    function getDistance(x1, y1, x2, y2){
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    //==================================================================

    // При изменении значения слайдера, не изменяется количество кругов
    // Круги слипаются

    //==================================================================

// Физика соударения
    let physics = ()=>{

        // Переменные объявляем вначале, а не цикле, чтобы не забивать память
        let distanceX;
        let distanceY;
        let minDistance;
        let distance;
        let vX1;
        let vY1;
        let vX2;
        let vY2;
        let m1;
        let m2;
        let isWas = [];
        let check;


        // Проверяем каждый, кроме последнего, последнего "i < circles.length - 1", но сравниваем с каждым "j < circles.length"
        for (let i = 0; i < circles.length - 1; i++){

            // Если мы уже обрабатывали этот круг, то пропускаем итерацию
            check = false;
            for (let w = 0; w < isWas.length; w++){
                if (i === isWas[w]){check = true;}
            }
            if (check){continue;}

            for (let j = 0; j < circles.length; j++){

                // С самим собой не сравниваем
                if(i===j){continue;}

                // Необходимые параметры
                distanceX = Math.abs(circles[i].x - circles[j].x);
                distanceY = Math.abs(circles[i].y - circles[j].y);
                minDistance = circles[i].totalRadius + circles[j].totalRadius;

                // Предварительная проверка для оптимизации
                if (distanceX <= minDistance && distanceY <= minDistance){
                    distance = getDistance(circles[i].x,circles[i].y,circles[j].x,circles[j].y);

                    // Окончательная проверка
                    if (distance <= minDistance){

                        // Необходимые параметры
                        vX1 = circles[i].vector.x;
                        vY1 = circles[i].vector.y;
                        vX2 = circles[j].vector.x;
                        vY2 = circles[j].vector.y;
                        m1 = circles[i].mass;
                        m2 = circles[j].mass;

                        // Устанавливаем значения в соотвествии с законом сохранения энергии
                        circles[i].vector.x = vX1/(m1+m2)*(m1-m2)+vX2/(m1+m2)*(2*m2);
                        circles[i].vector.x = vX1/(m1+m2)*(2*m1)+vX2/(m1+m2)*(m2-m1);
                        circles[j].vector.y = vY1/(m1+m2)*(m1-m2)+vY2/(m1+m2)*(2*m2);
                        circles[j].vector.y = vY1/(m1+m2)*(2*m1)+vY2/(m1+m2)*(m2-m1);

                        // Чтобы circles[j] уже не проверять
                        isWas.push(j);
                    }
                }
            }
        }
    };

// Анимации
    let animation;
    function loop() {
        // При нажатии на SUBMIT с каждым нажатием скорость кругов увеличивается, cancelAnimationFrame предотвращает эту проблему
        cancelAnimationFrame(animation);
        CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height);
        for (let i=0; i < circles.length; i++){
            circles[i].move();
        }
        physics();
        animation = requestAnimationFrame(loop);
    }

// Анимацию на кнопку
    SUBMIT.addEventListener('click',function () {
        createCircle();
        animation = requestAnimationFrame(loop);
    });


}());

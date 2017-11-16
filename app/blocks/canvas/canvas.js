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
    let circleSettint = {
        speed: 7,
        color: [
            "#bfdefe",
            "#8fcafe",
            "#dbcdf0",
        ]
    };
    Circle = function () {
        let kind = randomInt(0,2);
        this.radius = (Math.random() + 1)*Math.sqrt(CANVAS.height * CANVAS.width / VALUE_SLIDER) / 2 * 0.1;
        this.x = Math.random()*(CANVAS.width - this.radius*2) + this.radius;
        this.y = Math.random()*(CANVAS.height - this.radius*2) + this.radius;
        this.color = circleSettint.color[kind];
        this.strokeStyle = this.color;
        this.lineWidth = 5;
        this.totalRadius = this.radius + this.lineWidth;
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

// Анимации
    let animation;
    function loop() {
        // При нажатии на SUBMIT с каждым нажатием скорость кругов увеличивается, cancelAnimationFrame предотвращает эту проблему
        cancelAnimationFrame(animation);
        CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height);
        for (let i=0; i < circles.length; i++){
            circles[i].move();
        }
        animation = requestAnimationFrame(loop);
    }

// Анимацию на кнопку
    SUBMIT.addEventListener('click',function () {
        createCircle();
        animation = requestAnimationFrame(loop);
    });


}());

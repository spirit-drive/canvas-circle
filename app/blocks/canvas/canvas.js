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

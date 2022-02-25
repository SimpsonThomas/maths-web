 /*const canvasOnWheel = (event, canvas=canvas1, context=context1)=>{
    console.log(zoom.time)
    event.preventDefault()
    let now = Date.now()
    console.log(now-zoom.time < 1000)
    if (now-zoom.time < 1000) return
    else {
        console.log('Heres')
        var scale = 1;
        var originx = 0;
        var originy = 0;
        var mousex = event.clientX - canvas.offsetLeft;
        var mousey = event.clientY - canvas.offsetTop;
        var wheel = event.wheelDelta/120;//n or -n
        setZoom({zoom:zoom.zoom + wheel/100, time:now})
        /*context.translate(
            originx,
            originy
        );
        context.scale(zoom,zoom);
        context.translate(
            -( mousex / scale + originx - mousex / ( scale * zoom ) ),
            -( mousey / scale + originy - mousey / ( scale * zoom ) )
        );
    
        originx = ( mousex / scale + originx - mousex / ( scale * zoom ) );
        originy = ( mousey / scale + originy - mousey / ( scale * zoom ) );
        scale *= zoom;
    }
}

canvas1.addEventListener('wheel', canvasOnWheel)*/
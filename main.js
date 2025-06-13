// HERENCIA//                             
class ObjetoJuego {
  constructor(container, x, y, width, height) {
    this.container = container;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.container.appendChild(this.element);

    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
 //Vacío a Propósito//
  mover() { }  
  colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }
}
// ejemplo HERENCIA//
class Personaje extends ObjetoJuego { 
  constructor(container, imgSrc, x, y) {
    super(container, x, y, 70, 80);

    this.velocidad = 10;
    this.saltando = false;
    this.direccion = "derecha";

    this.img = document.createElement("img");
    this.img.src = imgSrc;
    this.img.style.width = "100%";
    this.img.style.height = "100%";
    this.img.style.objectFit = "contain";
    this.img.style.objectPosition = "bottom";
    this.img.style.transition = "transform 0.2s ease";
    this.element.appendChild(this.img);
  }
  // HEREDA EL METODO MOVER Y IMPLEMENTA SUS CARACTERISTICA(POLIMORFISMO)  
  // El parametro (evento) permite que el personaje reaccione a las acciones del usuario  
  mover(evento) {
    const contRect = this.container.getBoundingClientRect();
    if (evento.key === "ArrowRight") {
      this.x += this.velocidad;
      const maxX = contRect.width - this.width;
      if (this.x > maxX) this.x = maxX;

      this.direccion = "derecha";
      this.img.style.transform = "scaleX(1)";
    } else if (evento.key === "ArrowLeft") {
      this.x -= this.velocidad;
      if (this.x < 0) this.x = 0;

      this.direccion = "izquierda";
      this.img.style.transform = "scaleX(-1)";
    } else if (evento.key === "ArrowUp" && !this.saltando) {
      this.saltar();
    } else if (evento.key === "ArrowDown") {
      this.agacharse();
    }

    this.actualizarPosicion();
  }

  saltar() {
    this.saltando = true;

    const alturaMaxima = Math.max(this.y - 120, 0);
    const salto = setInterval(() => {
      if (this.y > alturaMaxima) {
        this.y -= 8;
      } else {
        clearInterval(salto);
        this.caer();
      }
      this.actualizarPosicion();
    }, 20);
  }

  caer() {
    const suelo = 190; // Altura Y del suelo donde el personaje debe aterrizar

    const gravedad = setInterval(() => {
      if (this.y + 8 >= suelo) {
        this.y = suelo;
        clearInterval(gravedad);
        this.saltando = false;
      } else {
        this.y += 8;
      }
      this.actualizarPosicion();
    }, 20);
  }


  agacharse() {
    this.element.style.transform = "scaleY(0.6)";
    setTimeout(() => {
      this.element.style.transform = "scaleY(1)";
    }, 800);
  }
}
// HERENCIA//
class Adversario extends ObjetoJuego {
  constructor(container, index, total) {
    const width = 60;
    const height = 60;

    const containerRect = container.getBoundingClientRect();
    const espacioEntre = 20;
    const totalAncho = total * width + (total - 1) * espacioEntre;
    const margenIzquierdo = (containerRect.width - totalAncho) / 2;

    const x = margenIzquierdo + index * (width + espacioEntre);
    const alturasPosibles = [80, 100, 200];
    const y = containerRect.height - height - alturasPosibles[Math.floor(Math.random() * alturasPosibles.length)];

    super(container, x, y, width, height);

    this.xInicial = x;
    this.velocidadX = 0.5 + Math.random() * 0.5;
    if (Math.random() < 0.5) this.velocidadX *= -1;

    const img = document.createElement("img");
    img.src = "jugadores.png";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    this.element.appendChild(img);
  }


  // HEREDA EL METODO MOVER Y IMPLEMENTA SUS CARACTERISTICA(POLIMORFISMO)
  // no recibe parametros(evento) es porque su movimiento 
  // es autónomo y predefinido, no está impulsado por la
  //  interacción directa del usuario.
  mover() {
    const rangoMovimiento = 20;
    this.x += this.velocidadX;

    if (this.x > this.xInicial + rangoMovimiento) {
      this.x = this.xInicial + rangoMovimiento;
      this.velocidadX *= -1;
    } else if (this.x < this.xInicial - rangoMovimiento) {
      this.x = this.xInicial - rangoMovimiento;
      this.velocidadX *= -1;
    }

    this.actualizarPosicion();
  }
}

class Game {
  constructor() {
    this.container = document.getElementById("game-container");

    this.personaje1 = new Personaje(this.container, "niño-futbol.png", 60, 190);
    this.personaje2 = new Personaje(this.container, "arbitro1.png", 850, 290);

    this.monedas = [];
    this.puntuacion = 0;
    this.tiempo = 20;
    this.puntosElement = document.getElementById("puntos");

    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        const moneda = new Adversario(this.container, i, 6);
        this.monedas.push(moneda);
      }
      this.iniciarMovimientoMonedas();
    }, 0);

    this.agregarEventos();
    this.iniciarTemporizador();

    window.addEventListener("keydown", () => {
      const audio = document.getElementById("musica-fondo");
      if (audio && audio.paused) {
        audio.currentTime = 17;
        audio.play();

        this.musicaTimeout = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, this.tiempo * 1000);
      }
    }, { once: true });
  }

  iniciarMovimientoMonedas() {
    setInterval(() => {
      this.monedas.forEach(moneda => moneda.mover());
    }, 30);
  }

  agregarEventos() {
    window.addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
        this.personaje1.mover(e);
      }
    });

    this.checkColisiones();
  }

  checkColisiones() {
    setInterval(() => {
      this.monedas.forEach((moneda, index) => {
        if (this.personaje1.colisionaCon(moneda)) {
          this.container.removeChild(moneda.element);
          this.monedas.splice(index, 1);
          this.actualizarPuntuacion(1);
        }
      });
    }, 100);
  }

  actualizarPuntuacion(puntos) {
    this.puntuacion += puntos;
    this.puntosElement.textContent = `Jugadores: ${this.puntuacion}`;
  }

 iniciarTemporizador() {
  const tiempoElemento = document.getElementById("tiempo");

  this.intervaloTiempo = setInterval(() => {
    this.tiempo--;
    tiempoElemento.textContent = `Tiempo: ${this.tiempo}`;

    if (this.tiempo <= 0) {
      clearInterval(this.intervaloTiempo);

      const audio = document.getElementById("musica-fondo");
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      if (this.musicaTimeout) {
        clearTimeout(this.musicaTimeout);
      }

      // Mostrar mensaje final en pantalla
      const mensajeFinal = document.getElementById("mensaje-final");
      if (mensajeFinal) {
        mensajeFinal.textContent = `⏰ ¡Tiempo terminado! Puntaje final: ${this.puntuacion}`;
        mensajeFinal.style.display = "block";
      }

      // Esperar 5 segundos antes de recargar la página
      setTimeout(() => {
        location.reload();
      }, 5000);
    }
  }, 1000);
}

}

// Inicializar juego
document.addEventListener("DOMContentLoaded", () => {
  const juego = new Game();
});




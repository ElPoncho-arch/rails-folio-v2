import { Controller } from "@hotwired/stimulus"

// data-controller="blob"
export default class extends Controller {
  static targets = ["blob"]

  connect() {
    console.log("🎨 BlobController • breathing + dynamic shadow (multi-blobs + base offsets)")

    this.cursor = { x: 0, y: 0 }
    this.offset = { x: 0, y: 0 }

    // tuning du mouvement
    this.speed = 0.12
    this.centerPull = 0.05
    this.maxOffset = 80

    // lire les offsets initiaux déclarés dans le HTML
    this.basePositions = this.blobTargets.map(el => ({
      x: parseFloat(el.dataset.baseX || 0),
      y: parseFloat(el.dataset.baseY || 0)
    }))

    this.onMouseMove = this.onMouseMove.bind(this)
    this.animate = this.animate.bind(this)

    window.addEventListener("mousemove", this.onMouseMove)
    requestAnimationFrame(this.animate)
  }

  disconnect() {
    window.removeEventListener("mousemove", this.onMouseMove)
  }

  onMouseMove(event) {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    let dx = event.clientX - centerX
    let dy = event.clientY - centerY
    const dist = Math.hypot(dx, dy)

    if (dist > this.maxOffset) {
      dx = (dx / dist) * this.maxOffset
      dy = (dy / dist) * this.maxOffset
    }

    this.cursor.x = dx
    this.cursor.y = dy
  }

  animate() {
    // retour progressif vers le centre
    this.cursor.x += (0 - this.cursor.x) * this.centerPull
    this.cursor.y += (0 - this.cursor.y) * this.centerPull

    // interpolation
    this.offset.x += (this.cursor.x - this.offset.x) * this.speed
    this.offset.y += (this.cursor.y - this.offset.y) * this.speed

    // mise à jour des halos
    this.blobTargets.forEach((el, index) => {
      const parallax = index === 0 ? 1.0 : 1.35
      const lag      = index === 0 ? 1.0 : 0.92

      const moveX = this.offset.x * parallax * lag
      const moveY = this.offset.y * parallax * lag

      // 🎯 AJOUT : offsets de base déclarés par l’utilisateur
      const baseX = this.basePositions[index].x
      const baseY = this.basePositions[index].y

      const finalX = moveX + baseX
      const finalY = moveY + baseY

      // transform final
      el.style.transform =
        `translate(-50%, -50%) translate(${finalX}px, ${finalY}px)`

      // shadow dynamique
      const dist = Math.hypot(finalX, finalY)
      const intensityBase = 0.35 + Math.min(dist / 200, 0.25)
      const intensity = intensityBase * (index === 0 ? 1.0 : 0.7)

      const shadowX = finalX * 0.35
      const shadowY = finalY * 0.35
      const blur   = index === 0 ? 180 : 220
      const spread = index === 0 ? 40 : 60

      el.style.boxShadow =
        `${shadowX}px ${shadowY}px ${blur}px ${spread}px rgba(36, 92, 255, ${intensity})`
    })

    requestAnimationFrame(this.animate)
  }
}

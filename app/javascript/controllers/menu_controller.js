import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button"]

  toggle() {
    this.buttonTarget.classList.toggle("is-open")
  }
}

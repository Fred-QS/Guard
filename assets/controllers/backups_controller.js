import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    connect() {
        console.log(this.element)
    }
}

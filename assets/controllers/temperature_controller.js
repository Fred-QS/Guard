import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = ['container', 'title', 'wrapper']
    interval = null;

    connect() {
        this.xhr()
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.xhr()
        }, 2000)
    }

    xhr() {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', 'temperatures')
        const options = {
            method: 'POST',
            body: formData,
        };
        fetch(url, options)
            .then(response => response.json())
            .then(success => this.handleXHRResult(success))
            .catch(error => this.handleXHRResult({data: null, error: 'Something went wrong with traffic_controller.js XHR call.'})
            )
    }

    handleXHRResult(response) {
        if (response.error === null) {
            this.containerTarget.innerHTML = ''
            this.containerTarget.removeAttribute('data-highlighted')
            this.containerTarget.insertAdjacentHTML('beforeend', response.data.info.join("\n"))
            this.titleTarget.innerHTML = response.data.title
            this.wrapperTarget.classList.remove('hidden')
            hljs.highlightAll()
        } else {
            console.warn(response.error)
        }
    }
}

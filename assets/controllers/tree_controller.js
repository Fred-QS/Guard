import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {
    
    static targets = ['file', 'folder', 'return']
    loader = document.querySelector('#arbo-loader')
    closeModal = document.querySelector('#server-modal-close')
    modal = document.querySelector('#server-modal')
    container = document.querySelector('#server-modal-container')
    wrapper = document.querySelector('#arbo-wrapper')
    filename = document.querySelector('#server-modal-filename')

    connect() {
        for (let i = 0; i < this.fileTargets.length; i++) {
            this.fileTargets[i].onclick = (e) => {
                const target = e.currentTarget
                const type = 'file'
                const path = target.dataset.path
                const hash = null
                this.loader.classList.remove('hidden')
                this.xhr({type, path, hash})
            }
        }
        for (let i = 0; i < this.folderTargets.length; i++) {
            this.folderTargets[i].onclick = (e) => {
                const target = e.currentTarget
                const type = 'folder'
                const path = target.dataset.path
                const hash = target.dataset.hash
                this.loader.classList.remove('hidden')
                this.xhr({type, path, hash})
            }
        }
        if (this.hasReturnTarget) {
            this.returnTarget.onclick = (e) => {
                const target = e.currentTarget
                const type = 'return'
                const path = target.dataset.path
                const hash = null
                this.loader.classList.remove('hidden')
                this.xhr({type, path, hash})
            }
        }
        if (this.closeModal) {
            this.closeModal.onclick = () => {
                this.container.innerHTML = ''
                this.container.removeAttribute('class')
                this.container.removeAttribute('data-highlighted')
                this.filename.innerHTML = ''
                this.modal.classList.add('hidden')
            }
        }
    }

    xhr(data) {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', 'treeStructure')
        formData.append('type', data.type)
        formData.append('path', data.path)
        formData.append('hash', data.hash)
        const options = {
            method: 'POST',
            body: formData,
        };
        fetch(url, options)
            .then(response => response.json())
            .then(success => this.handleXHRResult(success))
            .catch(error => this.handleXHRResult({data: null, error: 'Something went wrong with tree_controller.js XHR call.'})
        )
    }

    handleXHRResult(response) {
        this.loader.classList.add('hidden')
        if (response.error === null) {
            if (response.data.type === 'folder' || response.data.type === 'return') {
                this.wrapper.innerHTML = ''
                this.wrapper.insertAdjacentHTML('beforeend', response.data.dom)
                this.wrapper.scrollTo(0, 0)
            } else if (response.data.type === 'file') {
                this.container.innerHTML = ''
                this.container.insertAdjacentHTML('beforeend', response.data.dom)
                const extension = typeof hljs.getLanguage(response.data.extension) === "undefined" ? 'bash' : response.data.extension
                this.container.classList.add('language-' + extension)
                hljs.highlightAll()
                this.filename.innerHTML = response.data.name
                this.modal.classList.remove('hidden')
            }
        } else {
            console.warn(response.error)
        }
    }
}

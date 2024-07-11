import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = [
        'name',
        'path',
        'endpoint',
        'type',
        'db',
        'customer',
        'create',
        'creationLoader',
        'list',
        'listLoader'
    ]

    connect() {
        this.pathTarget.onfocus = (e) => {
            const parent = e.currentTarget.parentElement
            if (e.currentTarget.value.trim().length < 1 || e.currentTarget.value.trim().length > 2) {
                parent.classList.add('ring-2', 'ring-inset', 'ring-emerald-500')
            }
        }
        this.pathTarget.onblur = (e) => {
            const parent = e.currentTarget.parentElement
            if (e.currentTarget.value.trim().length < 1 || e.currentTarget.value.trim().length > 2) {
                parent.classList.remove('ring-2', 'ring-inset', 'ring-emerald-500')
            }
        }
        this.nameTarget.oninput = (e) => {
            const elmt = e.currentTarget
            if (elmt.value.trim().length > 0 && elmt.value.trim().length < 3) {
                elmt.classList.remove('text-white', 'ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-inset', 'focus:ring-emerald-500')
                elmt.classList.add('text-red-500', 'ring-2', 'ring-red-500')
            } else {
                elmt.classList.remove('text-red-500', 'ring-2', 'ring-red-500')
                elmt.classList.add('text-white', 'ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-inset', 'focus:ring-emerald-500')
            }
            this.getData(e.currentTarget)
        }
        this.pathTarget.oninput = (e) => {
            const elmt = e.currentTarget
            const parent = elmt.parentElement
            if (elmt.value.trim().length > 0 && elmt.value.trim().length < 3) {
                elmt.classList.remove('text-white')
                elmt.classList.add('text-red-500')
                elmt.previousElementSibling.classList.remove('text-emerald-500')
                elmt.previousElementSibling.classList.add('text-red-500')
                parent.classList.remove('ring-2', 'ring-inset', 'ring-emerald-500', 'ring-1', 'ring-white/10')
                parent.classList.add('ring-2', 'ring-inset', 'ring-red-500')
            } else {
                elmt.classList.remove('text-red-500')
                elmt.classList.add('text-white')
                elmt.previousElementSibling.classList.remove('text-red-500')
                elmt.previousElementSibling.classList.add('text-emerald-500')
                parent.classList.remove('ring-2', 'ring-inset', 'ring-red-500')
                parent.classList.add('ring-2', 'ring-inset', 'ring-emerald-500')
            }
            this.getData(e.currentTarget)
        }
        this.endpointTarget.oninput = (e) => {
            const elmt = e.currentTarget
            if (elmt.value.trim().length > 0 && elmt.value.trim().length < 3) {
                elmt.classList.remove('text-white', 'ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-inset', 'focus:ring-emerald-500')
                elmt.classList.add('text-red-500', 'ring-2', 'ring-red-500')
            } else {
                elmt.classList.remove('text-red-500', 'ring-2', 'ring-red-500')
                elmt.classList.add('text-white', 'ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-inset', 'focus:ring-emerald-500')
            }
            this.getData(e.currentTarget)
        }
        this.typeTarget.onchange = (e) => {
            this.getData(e.currentTarget)
        }
        this.dbTarget.onchange = (e) => {
            this.getData(e.currentTarget)
        }
        this.customerTarget.oninput = (e) => {
            this.getData(e.currentTarget)
        }
        this.createTarget.onclick = (e) => {
            this.creationLoaderTarget.classList.remove('hidden')
            this.listLoaderTarget.classList.remove('hidden')
            const data = {
                name: this.nameTarget.value.trim(),
                path: '/var/www/html/' + this.pathTarget.value.trim(),
                endpoint: this.endpointTarget.value.trim(),
                type: this.typeTarget.value,
                db: this.dbTarget.value === 'none' ? null : this.dbTarget.value,
                customer: this.customerTarget.value.trim().length > 0 ? this.customerTarget.value.trim() : null
            }
            this.xhr(JSON.stringify(data), 'createSite')
        }
    }

    getData(elmt) {
        const value = elmt.value
        if (this.nameTarget.value.trim().length > 2
            && this.pathTarget.value.trim().length > 2
            && this.endpointTarget.value.trim().length > 2
        ) {
            this.createTarget.disabled = false
        } else {
            this.createTarget.disabled = true
        }
    }

    xhr(data, controller) {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', controller)
        formData.append('data', data)
        const options = {
            method: 'POST',
            body: formData,
        };
        fetch(url, options)
            .then(response => response.json())
            .then(success => this.handleXHRResult(success))
            .catch(error => this.handleXHRResult({data: null, error: error})
            )
    }

    handleXHRResult(response) {
        if (response.error === null) {
            if (response.controller === 'createSite') {
                console.log(response.data)
            }
        } else {
            console.warn(response.error)
        }
        this.creationLoaderTarget.classList.add('hidden')
        this.listLoaderTarget.classList.add('hidden')
    }
}

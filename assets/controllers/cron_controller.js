import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = [
        'expression',
        'args',
        'preview',
        'loader',
        'test',
        'create',
        'message',
        'closeTest',
        'creationLoader',
        'delete',
        'deleteLoader'
    ]

    connect() {
        this.expressionTarget.oninput = (e) => {
            const elmt = e.currentTarget;
            if (elmt.value.length > 0) {
                this.loaderTarget.classList.remove('hidden')
                this.setLogic()
            } else {
                elmt.classList.remove('ring-2', 'text-red-500', 'ring-red-500')
                elmt.classList.add('ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-emerald-500', 'text-white')
                this.previewTarget.innerHTML = ''
            }
        }
        this.argsTarget.oninput = (e) => {
            const elmt = e.currentTarget;
            this.loaderTarget.classList.remove('hidden')
            if (elmt.value.length > 0 && elmt.value.length < 4) {
                elmt.classList.remove('ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-emerald-500', 'text-white')
                elmt.classList.add('ring-2', 'text-red-500', 'ring-red-500')
            } else {
                elmt.classList.remove('ring-2', 'text-red-500', 'ring-red-500')
                elmt.classList.add('ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-emerald-500', 'text-white')
            }
            this.setLogic()
        }
        this.testTarget.onclick = () => {
            this.loaderTarget.classList.remove('hidden')
            let cmd = this.argsTarget.value.trim()
            cmd = !cmd.endsWith('2>&1') ? cmd + ' 2>&1' : cmd
            const formData = new FormData()
            const url = '/admin/xhr'
            formData.append('controller', 'testCronExpression')
            formData.append('cmd', cmd)
            const options = {
                method: 'POST',
                body: formData,
            };
            fetch(url, options)
                .then(response => response.json())
                .then(success => this.handleCmdTestResult(success))
                .catch(error => this.handleCmdTestResult({data: null, error: error, html: null})
                )
        }
        this.createTarget.onclick = () => {
            this.creationLoaderTarget.classList.remove('hidden')
            const cmd = this.expressionTarget.value.trim() + ' ' + this.argsTarget.value.trim()
            const formData = new FormData()
            const url = '/admin/xhr'
            formData.append('controller', 'createCronTask')
            formData.append('cmd', cmd)
            const options = {
                method: 'POST',
                body: formData,
            };
            fetch(url, options)
                .then(response => response.json())
                .then(success => this.handleCmdCreationResult(success))
                .catch(error => this.handleCmdCreationResult({data: null, error: error})
                )
        }
        if (this.hasDeleteTarget) {
            for (let i = 0; i < this.deleteTargets.length; i++) {
                this.deleteTargets[i].onclick = (e) => {
                    const value = JSON.parse(e.currentTarget.dataset.task)
                    const message = value.message
                    this.deleteLoaderTarget.classList.remove('hidden')
                    const formData = new FormData()
                    const url = '/admin/xhr'
                    formData.append('controller', 'deleteCronTask')
                    formData.append('cmd', message)
                    const options = {
                        method: 'POST',
                        body: formData,
                    };
                    fetch(url, options)
                        .then(response => response.json())
                        .then(success => this.handleCmdDeleteResult(success))
                        .catch(error => this.handleCmdDeleteResult({data: null, error: error})
                        )
                }
            }
        }
    }

    handleCmdDeleteResult(response) {
        if (response.error === null) {
            window.location.reload(true)
        } else {
            console.log(response.error)
            this.deleteLoaderTarget.classList.add('hidden')
        }
    }

    handleCmdCreationResult(response) {
        if (response.error === null) {
            window.location.reload(true)
        } else {
            console.log(response.error)
            this.creationLoaderTarget.classList.add('hidden')
        }
    }

    handleCmdTestResult(response) {
        if (response.error === null) {
            if (response.html !== null) {
                this.messageTarget.innerHTML = '';
                this.messageTarget.insertAdjacentHTML('beforeend', response.html)
                this.closeTestTarget.onclick = () => {
                    this.messageTarget.innerHTML = '';
                }
            }
        } else {
            console.warn(response.error)
        }
        this.loaderTarget.classList.add('hidden')
    }

    setLogic() {
        const expression = this.expressionTarget.value.trim()
        const args = this.argsTarget.value.trim()
        const line = expression + ' ' + args
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', 'checkCronExpression')
        formData.append('expression', line)
        const options = {
            method: 'POST',
            body: formData,
        };
        fetch(url, options)
            .then(response => response.json())
            .then(success => this.handleValidityResult(success))
            .catch(error => this.handleValidityResult({stt: false, details: null, error: 'Something went wrong with cron_controller.js XHR call.'})
            )
    }

    handleValidityResult(response) {
        this.loaderTarget.classList.add('hidden')
        this.createTarget.disabled = true
        if (response.error === null) {
            if (response.stt === true) {
                this.expressionTarget.classList.remove('ring-2', 'text-red-500', 'ring-red-500')
                this.expressionTarget.classList.add('ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-emerald-500', 'text-white')
                if (this.argsTarget.value.trim().length > 3) {
                    this.testTarget.classList.remove('hidden')
                    this.createTarget.disabled = false
                } else {
                    this.testTarget.classList.add('hidden')
                }
            } else {
                this.expressionTarget.classList.remove('ring-1', 'ring-white/10', 'focus:ring-2', 'focus:ring-emerald-500', 'text-white')
                this.expressionTarget.classList.add('ring-2', 'text-red-500', 'ring-red-500')
                this.testTarget.classList.add('hidden')
            }
            this.previewTarget.innerHTML = response.html
        } else {
            console.warn(response.error)
            this.testTarget.classList.add('hidden')
        }
    }
}

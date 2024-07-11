import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = [
        'total',
        'loader',
        'perPage',
        'order',
        'like',
        'searchBtn',
        'searchInput',
        'pageInput',
        'paginator',
        'searchBy',
        'crud',
        'playAction',
        'stopAction',
        'moreAction',
        'modal',
        'closeDetails'
    ];

    connect() {
        this.listeners()
    }

    listeners() {
        if (this.hasPageInputTarget) {
            this.pageInputTarget.oninput = (e) => {
                const input = e.currentTarget
                input.value = input.value.replace(/\D/g,'')
            }
        }
        if (this.hasPerPageTarget) {
            for (let i = 0; i < this.perPageTargets.length; i++) {
                this.perPageTargets[i].onchange = (e) => {
                    const value = e.currentTarget.value
                    for (let j = 0; j < this.perPageTargets.length; j++) {
                        this.perPageTargets[j].value = value;
                    }
                }
            }
        }
        if (this.hasOrderTarget) {
            for (let i = 0; i < this.orderTargets.length; i++) {
                this.orderTargets[i].oninput = (e) => {
                    const value = e.currentTarget.value
                    const checked = e.currentTarget.checked
                    for (let j = 0; j < this.orderTargets.length; j++) {
                        this.orderTargets[j].checked = false
                    }
                    if (checked === true) {
                        for (let j = 0; j < this.orderTargets.length; j++) {
                            if (this.orderTargets[j].value === value) {
                                this.orderTargets[j].checked = true
                            }
                        }
                    }
                }
            }
        }
        if (this.hasLikeTarget) {
            for (let i = 0; i < this.likeTargets.length; i++) {
                this.likeTargets[i].onchange = (e) => {
                    const value = e.currentTarget.value
                    for (let j = 0; j < this.likeTargets.length; j++) {
                        this.likeTargets[j].value = value;
                    }
                }
            }
        }
        if (this.hasPaginatorTarget) {
            for (let i = 0; i < this.paginatorTargets.length; i++) {
                this.paginatorTargets[i].onclick = (e) => {
                    this.loaderTarget.classList.remove('hidden')
                    const span = e.currentTarget
                    const params = JSON.stringify(this.getParams(parseInt(span.dataset.page, 10)))
                    this.xhr({
                        type: 'search',
                        params: params
                    })
                }
            }
        }
        if (this.hasSearchInputTarget) {
            this.searchBtnTarget.onclick = () => {
                this.loaderTarget.classList.remove('hidden')
                const page = this.hasPageInputTarget ? parseInt(this.pageInputTarget.value, 10) : 1
                const params = JSON.stringify(this.getParams(page))
                this.xhr({
                    type: 'search',
                    params: params
                })
            }
        }
        if (this.hasPlayActionTarget) {
            for (let i = 0; i < this.playActionTargets.length; i++) {
                this.playActionTargets[i].onclick = (e) => {
                    this.loaderTarget.classList.remove('hidden')
                    const page = this.hasPageInputTarget ? parseInt(this.pageInputTarget.value, 10) : 1
                    let params = this.getParams(page)
                    params.action = 'start'
                    params.containerName = e.currentTarget.dataset.containerName
                    this.xhr({
                        type: 'search',
                        params: JSON.stringify(params)
                    }, 'containerAction')
                }
            }
        }
        if (this.hasStopActionTarget) {
            for (let i = 0; i < this.stopActionTargets.length; i++) {
                this.stopActionTargets[i].onclick = (e) => {
                    this.loaderTarget.classList.remove('hidden')
                    const page = this.hasPageInputTarget ? parseInt(this.pageInputTarget.value, 10) : 1
                    let params = this.getParams(page)
                    params.action = 'stop'
                    params.containerName = e.currentTarget.dataset.containerName
                    this.xhr({
                        type: 'search',
                        params: JSON.stringify(params)
                    }, 'containerAction')
                }
            }
        }
        if (this.hasMoreActionTarget) {
            for (let i = 0; i < this.moreActionTargets.length; i++) {
                this.moreActionTargets[i].onclick = (e) => {
                    this.loaderTarget.classList.remove('hidden')
                    const json = e.currentTarget.dataset.row
                    const formData = new FormData()
                    const url = '/admin/xhr'
                    formData.append('controller', 'containerDetails')
                    formData.append('json', json)
                    const options = {
                        method: 'POST',
                        body: formData,
                    };
                    fetch(url, options)
                        .then(response => response.json())
                        .then(success => this.handleDetailsResult(success))
                        .catch(error => this.handleDetailsResult({data: null, error: error})
                        )
                }
            }
        }
    }

    handleDetailsResult(response) {
        if (response.error === null) {
            this.modalTarget.innerHTML = ''
            this.modalTarget.insertAdjacentHTML('beforeend', response.data.dom)
            if (this.hasCloseDetailsTarget) {
                this.closeDetailsTarget.onclick = () => {
                    this.modalTarget.innerHTML = ''
                }
            }
        } else {
            console.warn(response.error)
        }
        this.loaderTarget.classList.add('hidden')
    }

    getParams(page) {
        return {
            page: page,
            limit: this.hasPerPageTarget ? parseInt(this.perPageTarget.value, 10) : 10,
            order: {
                by: this.hasLikeTarget ? this.likeTarget.value : null,
                dir: (() => {
                    const inputs = document.querySelectorAll('[name="order_sup"]')
                    for (let j = 0; j < inputs.length; j++) {
                        if (inputs[j].checked === true) {
                            return inputs[j].value
                        }
                    }
                    return 'ASC'
                })(),
            },
            search: {
                in: this.searchByTarget.value,
                text: this.searchInputTarget.value.trim().length > 0 ? this.searchInputTarget.value.trim() : null
            }
        }
    }

    xhr(data, controller = 'containers') {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', controller)
        formData.append('type', data.type)
        formData.append('params', data.params)
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
            const dom = response.data.dom
            const cmd = response.data.cmd
            console.log(cmd)
            if (dom !== null) {
                this.totalTarget.innerHTML = response.data.total
                this.crudTarget.innerHTML = ''
                this.crudTarget.insertAdjacentHTML('beforeend', dom)
            }
            this.listeners()
        } else {
            console.warn(response.error)
        }
        this.loaderTarget.classList.add('hidden')
    }
}

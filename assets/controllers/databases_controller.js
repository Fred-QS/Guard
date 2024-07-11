import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = [
        'db',
        'tableContainer',
        'columnsContainer',
        'table',
        'columnsLoader',
        'tableLoader',
        'perPage',
        'order',
        'like',
        'searchBtn',
        'searchInput',
        'pageInput',
        'paginator',
        'dbName',
        'tableName',
        'searchBy'
    ];

    connect() {
        this.listeners()
    }

    listeners() {
        if (this.hasDbTarget) {
            for (let i = 0; i < this.dbTargets.length; i++) {
                this.dbTargets[i].onclick = (e) => {
                    const db = e.currentTarget;
                    this.columnsLoaderTarget.classList.remove('hidden')
                    this.tableLoaderTarget.classList.remove('hidden')
                    for (let j = 0; j < this.dbTargets.length; j++) {
                        this.dbTargets[j].classList.remove('bg-gray-800')
                    }
                    db.classList.add('bg-gray-800')
                    this.xhr({type: 'db', db: db.dataset.db, table: null, params: null})
                }
            }
        }
        if (this.hasTableTarget) {
            for (let i = 0; i < this.tableTargets.length; i++) {
                this.tableTargets[i].onclick = (e) => {
                    const table = e.currentTarget;
                    this.tableLoaderTarget.classList.remove('hidden')
                    for (let j = 0; j < this.tableTargets.length; j++) {
                        this.tableTargets[j].classList.remove('bg-gray-800')
                    }
                    table.classList.add('bg-gray-800')
                    this.xhr({type: 'table', db: table.dataset.db, table: table.dataset.table, params: null})
                }
            }
        }
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
                    this.tableLoaderTarget.classList.remove('hidden')
                    const span = e.currentTarget
                    const params = JSON.stringify(this.getParams(parseInt(span.dataset.page, 10)))
                    this.xhr({
                        type: 'search',
                        db: this.dbNameTarget.textContent.trim(),
                        table: this.tableNameTarget.textContent.trim(),
                        params: params
                    })
                }
            }
        }
        if (this.hasSearchInputTarget) {
            this.searchBtnTarget.onclick = () => {
                this.tableLoaderTarget.classList.remove('hidden')
                const page = this.hasPageInputTarget ? parseInt(this.pageInputTarget.value, 10) : 1
                const params = JSON.stringify(this.getParams(page))
                this.xhr({
                    type: 'search',
                    db: this.dbNameTarget.textContent.trim(),
                    table: this.tableNameTarget.textContent.trim(),
                    params: params
                })
            }
        }
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

    xhr(data) {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', 'database')
        formData.append('type', data.type)
        formData.append('db', data.db)
        formData.append('table', data.table)
        formData.append('params', data.params)
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
        if (response.error === null) {
            const dom1 = response.data.dom1
            const dom2 = response.data.dom2
            if (dom1 !== null) {
                this.columnsContainerTarget.innerHTML = ''
                this.columnsContainerTarget.insertAdjacentHTML('beforeend', dom1)
            }
            if (dom2 !== null) {
                this.tableContainerTarget.innerHTML = ''
                this.tableContainerTarget.insertAdjacentHTML('beforeend', dom2)
            }
            this.listeners()
        } else {
            console.warn(response.error)
        }
        this.columnsLoaderTarget.classList.add('hidden')
        this.tableLoaderTarget.classList.add('hidden')
    }
}

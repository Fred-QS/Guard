import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = ['serverListToggles']
    firstContainer = document.querySelector('#first-server-list-container')

    connect() {
        const toggles = this.serverListTogglesTargets
        for (let i = 0; i < toggles.length; i++) {
            toggles[i].onclick = (e) => {
                const toggle = e.currentTarget
                this.toggle(toggle)
            }
        }
        if (this.firstContainer) {
            for (let i = 0; i < this.firstContainer.children.length; i++) {
                const label = this.firstContainer.children[i].querySelector('p')
                if (label && label.dataset.configTarget === 'serverListToggles') {
                    label.click()
                }
            }
        }
    }

    toggle(elmt) {
        const svg = elmt.querySelector('svg')
        if (svg.classList.contains('rotate-0')) {
            svg.classList.remove('rotate-0')
            svg.classList.add('rotate-180')
            elmt.nextElementSibling.classList.remove('hidden')
        } else {
            svg.classList.remove('rotate-180')
            svg.classList.add('rotate-0')
            elmt.nextElementSibling.classList.add('hidden')
            const allServerList = elmt.nextElementSibling.querySelectorAll('[data-config-target]')
            for (let i = 0; i < allServerList.length; i++) {
                const svgAll = allServerList[i].querySelector('svg')
                allServerList[i].nextElementSibling.classList.add('hidden')
                svgAll.classList.remove('rotate-180')
                svgAll.classList.add('rotate-0')
            }
        }
    }
}

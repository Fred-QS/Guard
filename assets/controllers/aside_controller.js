import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {
    static targets = ['mobileBackdrop', 'mobileSidebar', 'closeMobileSidebarButton', 'mobileMenu']

    connect() {
        this.isDesktop()

        this.closeMobileSidebarButtonTarget.onclick = () => {
            if (this.closeMobileSidebarButtonTarget.classList.contains('opacity-0')) {
                this.mobileBackdropTarget.classList.remove('hidden')
                this.mobileMenuTarget.classList.remove('hidden')
                setTimeout(() => {
                    //remove
                    this.mobileBackdropTarget.classList.remove('opacity-0')
                    this.mobileSidebarTarget.classList.remove('-translate-x-full')
                    this.closeMobileSidebarButtonTarget.classList.remove('opacity-0')
                    //add
                    this.mobileBackdropTarget.classList.add('opacity-100')
                    this.mobileSidebarTarget.classList.add('translate-x-0')
                    this.closeMobileSidebarButtonTarget.classList.add('opacity-100')
                }, 10)
            } else {

                //remove
                this.mobileBackdropTarget.classList.remove('opacity-100')
                this.mobileSidebarTarget.classList.remove('translate-x-0')
                this.closeMobileSidebarButtonTarget.classList.remove('opacity-100')
                //add
                this.mobileBackdropTarget.classList.add('opacity-0')
                this.mobileSidebarTarget.classList.add('-translate-x-full')
                this.closeMobileSidebarButtonTarget.classList.add('opacity-0')
                setTimeout(() => {
                    this.mobileBackdropTarget.classList.add('hidden')
                    this.mobileMenuTarget.classList.add('hidden')
                }, 350)
            }
        }

        window.onresize = () => {
            this.isDesktop()
        }
    }

    isDesktop() {
        if (window.innerWidth < 640) {
            document.querySelector('html').classList.remove('isDesktop')
        } else {
            document.querySelector('html').classList.add('isDesktop')
        }
    }
}

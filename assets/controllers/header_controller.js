import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {
    static targets = ['openProfileButton', 'profileDropdown', 'openMenuMobile']

    connect() {
        this.openMenuMobileTarget.onclick = () => {
            document.querySelector('[data-aside-target="closeMobileSidebarButton"]').click();
        }

        this.openProfileButtonTarget.onclick = () => {
            if (this.profileDropdownTarget.classList.contains('duration-100')) {
                // remove
                this.profileDropdownTarget.classList.remove('ease-out');
                this.profileDropdownTarget.classList.remove('duration-100');
                this.profileDropdownTarget.classList.remove('opacity-0');
                this.profileDropdownTarget.classList.remove('scale-95');
                // add
                this.profileDropdownTarget.classList.add('ease-in');
                this.profileDropdownTarget.classList.add('duration-75');
                this.profileDropdownTarget.classList.add('opacity-100');
                this.profileDropdownTarget.classList.add('scale-100');
            } else {
                // remove
                this.profileDropdownTarget.classList.remove('ease-in');
                this.profileDropdownTarget.classList.remove('duration-75');
                this.profileDropdownTarget.classList.remove('opacity-100');
                this.profileDropdownTarget.classList.remove('scale-100');
                // add
                this.profileDropdownTarget.classList.add('ease-out');
                this.profileDropdownTarget.classList.add('duration-100');
                this.profileDropdownTarget.classList.add('opacity-0');
                this.profileDropdownTarget.classList.add('scale-95');
            }
        }
    }
}

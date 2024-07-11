import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = [
        'driveSelector',
        'drivesLister',
        'drivesRefresh',
        'chart',
        'drive',
        'driveCombobox',
        'driveOptions'
    ]
    mainWrapper = document.querySelector('#admin-wrapper')

    connect() {
        this.driveSelectorTarget.onclick = () => {
            this.driveOptionsTarget.classList.toggle('hidden')
        }
        for (let i = 0; i < this.driveTargets.length; i++) {
            this.driveTargets[i].onclick = (event) => {
                for (let j = 0; j < this.driveTargets.length; j++) {
                    this.driveTargets[j].classList.remove('bg-gray-700')
                    this.driveTargets[j].querySelector('.drive-check').classList.add('hidden')
                }
                event.currentTarget.classList.add('bg-gray-700')
                event.currentTarget.querySelector('.drive-check').classList.remove('hidden')
                this.driveComboboxTarget.value = event.currentTarget.dataset.drive
                this.driveOptionsTarget.classList.toggle('hidden')
                this.xhr(event.currentTarget.dataset.drive, event.currentTarget.dataset.index)
            }
        }

        this.drivesRefreshTarget.onclick = () => {
            for (let i = 0; i < this.driveTargets.length; i++) {
                if (this.driveTargets[i].dataset.drive === this.driveComboboxTarget.value) {
                    this.xhr(this.driveTargets[i].dataset.drive, this.driveTargets[i].dataset.index)
                    break;
                }
            }
        }

        Highcharts.setOptions({
            colors: ['#10b981', '#4b5563'].map(function (color) {
                return {
                    radialGradient: {
                        cx: 0.5,
                        cy: 0.3,
                        r: 0.7
                    },
                    stops: [
                        [0, color],
                        [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                    ]
                };
            })
        });
        const mainDriveInfo = JSON.parse(this.chartTarget.dataset.drive)
        this.chartTarget.removeAttribute('data-drive')
        this.chartTarget.removeAttribute('data-index')
        this.setDrivesSizesCharts(mainDriveInfo)
    }

    setDrivesSizesCharts(data) {

        Highcharts.chart('charts', {
            responsive: {
                rules: [{
                    condition: {
                        maxHeight: 100,
                    }
                }]
            },
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                backgroundColor: 'rgba(0,0,0,0)'
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            tooltip: {
                backgroundColor: '#111827',
                pointFormat: '<b>{point.percentage:.1f}%</b>',
                style: {
                    color: '#10b981'
                },
                padding: 12,
                useHtml: true,
                shadow: false,
                hideDelay: 0,
                distance: 2
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    //colors: ['rgb(16 185 129)', 'rgb(51 65 85)'],
                    dataLabels: {
                        enabled: false,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        connectorColor: 'rgb(16 185 129)'
                    },
                    borderColor: 'rgb(75, 85, 99)'
                }
            },
            series: [{
                name: translations.messages.highcharts_drives_total,
                data: [
                    { name: translations.messages.highcharts_drives_used, y: data.percent.data },
                    { name: translations.messages.highcharts_drives_free, y: (100 - data.percent.data) }
                ]
            }]
        })
    }

    xhr(drive, index) {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', 'drives')
        formData.append('drive', drive)
        formData.append('index', index)
        const options = {
            method: 'POST',
            body: formData,
        };
        fetch(url, options)
            .then(response => response.json())
            .then(success => this.handleXHRResult(success))
            .catch(error => this.handleXHRResult({data: null, error: 'Something went wrong with server_controller.js XHR call.'})
            )
    }

    handleXHRResult(response) {
        if (response.error === null) {
            const dom = response.data.dom
            const drives = response.data.drives
            const index = response.data.index
            const drive = drives[index]
            this.drivesListerTarget.innerHTML = ''
            this.drivesListerTarget.insertAdjacentHTML('beforeend', dom)
            this.setDrivesSizesCharts(drive)
            this.mainWrapper.scrollTo(0, this.mainWrapper.scrollHeight)
        } else {
            console.warn(response.error)
        }
    }
}

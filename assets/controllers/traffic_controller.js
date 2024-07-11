import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'
export default class extends Controller {

    static targets = [
        'interfaceCombobox',
        'interfaceSelector',
        'interfaceOptions',
        'interface',
        'trafficDetails',
        'radiosInterface',
        'trafficRefresh',
        'traffic'
    ]
    mainWrapper = document.querySelector('#admin-wrapper')

    connect() {
        const mainInterface = this.trafficTarget.dataset.mainInterface
        const interfaces = JSON.parse(this.trafficTarget.dataset.interfaces)
        this.trafficTarget.removeAttribute('data-main-interface')
        this.trafficTarget.removeAttribute('data-interfaces')
        const interfaced = this.getInterface(interfaces, mainInterface)
        const frequency = this.getFrequency()
        this.setTrafficChart(interfaced, frequency)

        this.interfaceSelectorTarget.onclick = () => {
            this.interfaceOptionsTarget.classList.toggle('hidden')
        }
        for (let i = 0; i < this.interfaceTargets.length; i++) {
            this.interfaceTargets[i].onclick = (event) => {
                for (let j = 0; j < this.interfaceTargets.length; j++) {
                    this.interfaceTargets[j].classList.remove('bg-gray-700')
                    this.interfaceTargets[j].querySelector('.interface-check').classList.add('hidden')
                }
                event.currentTarget.classList.add('bg-gray-700')
                event.currentTarget.querySelector('.interface-check').classList.remove('hidden')
                this.interfaceComboboxTarget.value = event.currentTarget.dataset.interface
                this.interfaceOptionsTarget.classList.toggle('hidden')
                this.xhr(event.currentTarget.dataset.interface, event.currentTarget.dataset.index)
            }
        }

        this.trafficRefreshTarget.onclick = () => {
            for (let i = 0; i < this.interfaceTargets.length; i++) {
                if (this.interfaceTargets[i].dataset.interface === this.interfaceComboboxTarget.value) {
                    this.xhr(this.interfaceTargets[i].dataset.interface, this.interfaceTargets[i].dataset.index)
                    break;
                }
            }
        }
    }

    xhr(machine, index) {
        const formData = new FormData()
        const url = '/admin/xhr'
        formData.append('controller', 'traffic')
        formData.append('interface', machine)
        formData.append('index', index)
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
            const dom = response.data.dom
            const interfaces = response.data.interfaces
            const index = response.data.index
            const interfaced = interfaces[index]
            this.trafficDetailsTarget.innerHTML = ''
            this.trafficDetailsTarget.insertAdjacentHTML('beforeend', dom)
            this.setTrafficChart(interfaced, this.getFrequency())
            this.mainWrapper.scrollTo(0, this.mainWrapper.scrollHeight)
        } else {
            console.warn(response.error)
        }
    }

    getFrequency() {
        const inputs = this.radiosInterfaceTargets
        let frequency = 'hour'
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].checked === true) {
                frequency = inputs[i].value
            }
        }
        return frequency
    }

    getInterface(interfaces, mainInterface) {
        for (let i = 0; i < interfaces.length; i++) {
            if (interfaces[i].name === mainInterface) {
                return interfaces[i];
            }
        }
        return interfaces[0];
    }

    setTrafficChart(interfaced, frequency) {

        let list = interfaced.traffic[frequency]
        let machine = interfaced.name

        let rx = [],
            tx = [],
            dates = [];

        for (let i = 0; i < list.length; i++) {

            rx.push(list[i].rx);
            tx.push(list[i].tx);
            let time = (list[i].time) ? ' à ' + this.formatTimeFromTraffic(list[i].time) : '';
            dates.push(this.formatDateFromTraffic(list[i].date) + time);
        }

        Highcharts.setOptions({
            colors: ['#f59e0b', '#10b981'].map(function (color) {
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

        Highcharts.chart('traffic', {
            chart: {
                type: 'area',
                backgroundColor: 'rgba(0,0,0,0)'
            },
            legend: {
                itemStyle: {
                    color: '#10b981'
                },
                itemHiddenStyle: {
                    color: '#4b5563'
                },
                itemHoverStyle: {
                    color: '#10b981'
                }
            },
            accessibility: {
                description: translations.messages.highcharts_description
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: dates,
                labels: {
                    style: {
                        color: '#4b5563'
                    }
                },
                lineColor: '#4b5563'
            },
            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    formatter: function () {
                        return formatSize(this.value);
                    },
                    style: {
                        color: '#10b981'
                    }
                },
                gridLineColor: '#4b5563'
            },
            tooltip: {
                backgroundColor: '#111827',
                style: {
                    color: '#10b981'
                },
                padding: 12,
                useHtml: true,
                shadow: false,
                hideDelay: 0,
                formatter: function () {
                    return `${this.series.name}: ${translations.messages.highcharts_transfer} ${formatSize(this.y)} ${(frequency === 'month' || frequency === 'year') ? translations.messages.highcharts_on + ' ' + this.x : translations.messages.highcharts_at + ' ' + this.x}`;
                }
            },
            plotOptions: {
                connectorColor: 'rgb(16 185 129)',
                area: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'RX',
                data: rx

            }, {
                name: 'TX',
                data: tx

            }]
        });
    }

    formatDateFromTraffic(array) {

        let months = translations.months;
        let day = (array.day) ? array.day + ' ' : '';
        let month = (array.month) ? months[array.month-1] + ' ' : '';
        let date = day + month + array.year;
        return date;
    }

    formatTimeFromTraffic(array) {

        let minutes = '';
        if (array.minute) {
            minutes = (array.minute !== 0) ? array.minute + 'm' : '';
        }
        return array.hour + 'h ' + minutes;
    }
}

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import * as _ from 'underscore';

import * as Highcharts from 'highcharts';

import Utils from '../../Utils';

import ConfigurationStore from '../../stores/ConfigurationStore';

import { IOpportunity, IConfiguration } from '../../interfaces';

import { WSTheme, WSThemeObservable, onWSThemeChange } from '@ws/ws-web';

 

const Template = require('../../../templates/Card/ChartTemplate.rt');

 

class Chart extends React.PureComponent<any, any> {

    constructor(props) {

        super(props);

    }

    render() {

        return (

            <LineChart

                data={this.props.data}

                symbol={this.props.symbol}

                mid={this.props.mid}a

                last={this.props.last}

                arrowIcon={this.props.arrowIcon}

                arrowClass={this.props.arrowClass}

                arrowColor={this.props.arrowColor}

                priceChangePerc={this.props.priceChangePerc}

            />

        );

    }

}

 

@WSThemeObservable

class LineChart extends React.PureComponent<any, any> {

    __chart: any;

    __rect: any;

    __textMid: any;

    __textLast: any;

    __arrow: any;

    __textPriceChange: any;

    constructor(props) {

        super(props);

        _.bindAll(this, 'updateValues');

    }

    @onWSThemeChange

    private __onThemeChange(theme) {

        this.__annotate(this.props);

    }

    componentDidMount() {

        this.__chart = Highcharts.chart(this.refs.chart, {

            chart: {

                zoomType: 'x',

                height: 170,

                style: {

                    fontFamily: 'ITGFont'

                },

                marginTop: 60,

                marginLeft: 0,

                padding: 0,

                backgroundColor: 'transparent'

            },

            title: {

                text: null

            },

            credits: {

                enabled: false

            },

            xAxis: {

                type: 'category',

                title: {

                    text: null

                },

                labels: {

                    enabled: true,

                    style: {

                        fontSize: 16,

                        color: '#a9a9a9'

                    }

                },

                lineColor: 'transparent',

                tickInterval: 60,

                tickLength: 0,

                plotLines: [

                    {

                        color: 'rgba(145, 145, 145, 0.50)',

                        width: 2,

                        dashStyle: 'Dot',

                        value: 30

                    },

                    {

                        color: 'rgba(145, 145, 145, 0.50)',

                        width: 2,

                        dashStyle: 'Dot',

                        value: 90

                    },

                    ,

                    {

                        color: 'rgba(145, 145, 145, 0.50)',

                        width: 2,

                        dashStyle: 'Dot',

                        value: 150

                    }

                ]

            },

            yAxis: {

                title: {

                    text: null

                },

                labels: {

                    enabled: true,

                    style: {

                        fontSize: 16,

                        color: '#999'

                    }

                },

 

                tickPositioner: function() {

                    if (this.dataMin && this.dataMax != null) return [this.dataMin.toFixed(2), this.dataMax.toFixed(2)];

                },

                opposite: true,

                gridLineColor: 'transparent'

            },

            legend: {

                enabled: false

            },

            tooltip: {

                backgroundColor: 'white',

                lineColor: 'red',

                style: {

                    color: 'black'

                }

            },

            plotOptions: {

                area: {

                    fillColor: {

                        linearGradient: {

                            x1: 0,

                            y1: 0,

                            x2: 0,

                            y2: 1

                        },

                        stops: [[0, 'rgba(0, 159, 218, 0.8)'], [1, 'rgba(0, 159, 218, 0.4)']]

                    },

                    backgroundColor: '#f8f8f8',

                    lineWidth: 2,

                    lineColor: 'rgba(0, 159, 218, 1)',

                    states: {

                        hover: {

                            lineWidth: 2

                        }

                   },

                    marker: {

                        enabled: false

                    },

                    turboThreshold: 20000,

                    threshold: null

                },

                series: {

                    dataLabels: {

                        backgroundColor: 'rgba(0, 0, 0, 0.75)',

                        style: {

                            color: '#FFFFFF',

                            textOutline: 'none',

                            padding: 4

                        }

                    }

                }

            },

            series: [

                {

                    name: this.props.symbolTmp,

                    type: 'area',

                    data: this.props.chartTmp,

                    size: '100%',

                    innerSize: '85%',

                    dataLabels: {

                        enabled: false, //not showing last axis label

                        overflow: 'none',

                        crop: false,

                        align: 'left',

                        verticalAlign: 'middle',

                        x: 12,

                        padding: 0,

                        useHTML: true,

                        formatter: function() {

                            let last = this.series.data[this.series.data.length - 1];

                            if (this.point.category === last.category && this.point.y === last.y && this.series.last) {

                                return '<div class=midlabel>' + parseFloat(this.series.last).toFixed(2) + '</div>';

                            }

                        }

                    }

                }

            ],

            labels: {

                items: [

                    {

                        html: '<div>MID</div>',

                        style: {

                            left: '10px',

                            top: '-46px',

                            width: '100px',

                            fontSize: '16px',

                            color: 'rgba(145, 145, 145, 1.0)'

                        }

                    },

                    {

                        html: 'LAST',

                        style: {

                            left: '193px',

                            top: '-46px',

                            width: '100px',

                            fontSize: '16px',

                            color: 'rgba(145, 145, 145, 1.0)'

                        }

                    }

                ]

            }

        });

        if (this.props.data !== null) this.updateValues(this.props);

    }

    componentWillReceiveProps(props) {

        if (props.data !== null) this.updateValues(props);

    }

 

    updateValues(props) {

        if (props.data) {

            let chartTmp = [];

            props.data.forEach(element => {

                let x = element.split('|');

                x[1] = parseFloat(x[1]);

                let y = [];

                Object.assign(y, x);

                chartTmp.push(y);

            });

            // the order of these calls matter because this.__annotate makes changes to chart data

            this.__annotate(props);

            this.__chart.series[0].setData(chartTmp);

        }

    }

    __annotate(props) {

        if (this.__rect) this.__rect.destroy();

        this.__rect = this.__chart.renderer

            .rect()

            .attr({

                fill: WSTheme.current.cardBackground,

                width: this.__chart.containerWidth - this.__chart.marginRight - 1,

                height: 128,

                class: 'highcharts-plot-background',

                x: 0,

                y: 0

            })

            .add();

 

        if (this.__arrow) this.__arrow.destroy();

        this.__arrow = this.__chart.renderer

            .text(this.props.arrowIcon, 280, 58)

            // .attr({ class: 'fa ' + this.props.arrowClass })

            .attr({ class: 'ws-icon  ' + this.props.arrowClass })

            .css({ color: this.props.arrowColor, fontSize: '24px' })

            .add();

        if (this.__textPriceChange) this.__textPriceChange.destroy();

        let priceChangeVal = Number(this.props.priceChangePerc);

        let priceChgColor =

            isNaN(priceChangeVal) || priceChangeVal === 0

                ? WSTheme.current.mainForeground

                : priceChangeVal > 0 ? WSTheme.current.positiveColor : WSTheme.current.negativeColor;

        let sign = priceChangeVal > 0 ? '+' : ''; // '-' already attached to negative number

        this.__textPriceChange = this.__chart.renderer

            .text(sign + this.props.priceChangePerc + '%', 250, 26)

            .attr({ class: 'price-change-text' })

            .css({

                color: priceChgColor,

                fontSize: '16px'

            })

            .add();

        if (props.symbol) {

            let symbolTmp = props.symbol;

            this.__chart.series[0].name = symbolTmp;

        }

        if (props.last) {

            let lastTmp = props.last;

            this.__chart.series[0].last = lastTmp;

        }

        if (this.__textLast) this.__textLast.destroy();

        this.__textLast = this.__chart.renderer

            .text(props.last, 193, 54)

            .attr({ class: 'last-price-text' })

            .css({ color: WSTheme.current.mainForeground, fontSize: '24px' })

            .add();

        if (this.__textMid) this.__textMid.destroy();

        this.__textMid = this.__chart.renderer

            .text(props.mid, 10, 54)

            .attr({ class: 'mid-price-text' })

            .css({ color: WSTheme.current.positiveColor, fontSize: '24px' })

            .add();

    }

    render() {

        return Template.apply(this);

    }

}

 

export default Chart;
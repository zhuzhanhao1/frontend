<template>
  <div v-if="showCharts">
    <highcharts ref="chart" :options="assertChartOptions" :callback="chartCallback"
                class="my-chart"></highcharts>
    <highcharts ref="chart" :options="codeChartOptions" :callback="chartCallback" class="my-chart"></highcharts>
  </div>
</template>

<script>
import {getCharts} from "@/api/interface/interfaceTestReport";
import { Chart } from 'highcharts-vue'

export default {
  name: "charts",
  components: {highcharts: Chart},
  data() {
    return {
      showCharts: false,
      assertChartOptions: {
        chart: {
          // 指定内边距，下面的四个配置可以用 spacing: [10, 10, 15, 10] 来代替
          spacingBottom: -0,
          spacingTop: -0,
          spacingLeft: 0,
          spacingRight: 0,
          // 指定外边距
          margin: -10,
          // 指定图表大小
          width: 300,
          height: 300
          //显示边框
          // borderWidth: 1,
          // borderColor: 'red',
          // plotBorderWidth: 1,
          // plotBorderColor: 'yellow'
        },
        title: {
          text: '断言<br>结果',
          align: 'center',
          verticalAlign: 'middle',
          y: 50
        },
        tooltip: {
          headerFormat: '{series.name}<br>',
          pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: true,
              distance: -50,
              style: {
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0px 1px 2px black'
              }
            },
            startAngle: -90, // 圆环的开始角度
            endAngle: 90,    // 圆环的结束角度
            center: ['50%', '75%']
          }
        },
        series: [{
          type: 'pie',
          innerSize: '50%',
          name: '断言比例',
          data: []
        }],
        credits: {
          enabled: false
        }
      },
      codeChartOptions: {
        chart: {
          // 指定内边距，下面的四个配置可以用 spacing: [10, 10, 15, 10] 来代替
          spacingBottom: -0,
          spacingTop: -0,
          spacingLeft: 0,
          spacingRight: 0,
          // 指定外边距
          margin: -10,
          // 指定图表大小
          width: 300,
          height: 300
        },
        title: {
          text: '状态码',
          align: 'center',
          verticalAlign: 'middle',
          y: 50
        },
        tooltip: {
          headerFormat: '{series.name}<br>',
          pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: true,
              distance: -50,
              style: {
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0px 1px 2px black'
              }
            },
            startAngle: -90, // 圆环的开始角度
            endAngle: 90,    // 圆环的结束角度
            center: ['50%', '75%']
          }
        },
        series: [{
          type: 'pie',
          innerSize: '50%',
          name: '状态码比例',
          data: []
        }],
        credits: {
          enabled: false
        }
      }
    }
  },
  methods: {
    chartCallback() {
      console.log('图表渲染后的回调函数')
    },
    openCharts(query) {
      //获取Charts
      console.log(query)
      if (!query.runNumberId || !query.relatedId) {
        this.showCharts = false
        this.$message({message: '请选择运行结果的次数', type: 'warning'})
      } else {
        this.showCharts = true
        getCharts(query).then(resp => {
          console.log(resp)
          //渲染断言图表
          this.assertChartOptions.series[0].data = resp.assertChartList
          //渲染响应状态码图表
          this.codeChartOptions.series[0].data = resp.codeChartList
        })
      }

    }
  }
}
</script>

<style scoped>
.my-chart {
  float: left;
  margin-left: 50px;
}
</style>

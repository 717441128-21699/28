import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockDashboard, mockPredictions } from '@/data/orders';
import { formatMoney } from '@/utils/format';
import classnames from 'classnames';

const AdminPage: React.FC = () => {
  const data = mockDashboard;
  const predictions = mockPredictions;

  const maxDeals = Math.max(...data.dailyDealsTrend);
  const maxBrandRevenue = Math.max(...data.brandStats.map(b => b.revenue));
  const maxCityCount = Math.max(...data.cityStats.map(c => c.count));

  const handleExport = () => {
    Taro.showToast({ title: '报表已生成，正在下载...', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📊 运营管理看板</Text>
        <Text className={styles.headerSub}>实时数据 · {new Date().toLocaleDateString('zh-CN')}</Text>
        <View className={styles.filterRow}>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>品牌筛选</Text>
            <Text className={styles.filterValue}>全部品牌</Text>
          </View>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>城市筛选</Text>
            <Text className={styles.filterValue}>全部城市</Text>
          </View>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>时间范围</Text>
            <Text className={styles.filterValue}>近7天</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <View className={classnames(styles.statIcon, styles.blue)}>🚗</View>
          <Text className={styles.statValue}>{data.totalCars.toLocaleString()}</Text>
          <Text className={styles.statLabel}>在售车辆总数</Text>
          <Text className={styles.statTrend}>↑ 较昨日 +3.2%</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statIcon, styles.green)}>💹</View>
          <Text className={styles.statValue}>{data.dailyDeals}</Text>
          <Text className={styles.statLabel}>今日交易量</Text>
          <Text className={styles.statTrend}>↑ 较昨日 +8.6%</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statIcon, styles.orange)}>🏦</View>
          <Text className={styles.statValue}>¥{(data.totalLoanAmount / 10000).toFixed(0)}万</Text>
          <Text className={styles.statLabel}>金融累计放款</Text>
          <Text className={styles.statTrend}>↑ 较上月 +12.3%</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statIcon, styles.purple)}>📜</View>
          <Text className={styles.statValue}>{data.insurancePayoutRate}%</Text>
          <Text className={styles.statLabel}>保险赔付率</Text>
          <Text className={classnames(styles.statTrend, styles.down)}>↓ 较上月 -0.5%</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statIcon, styles.red)}>💬</View>
          <Text className={styles.statValue}>{data.csAverageTime}min</Text>
          <Text className={styles.statLabel}>客服平均处理</Text>
          <Text className={styles.statTrend}>↑ 较昨日 -5min</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statIcon, styles.cyan)}>👥</View>
          <Text className={styles.statValue}>{data.totalLoans}</Text>
          <Text className={styles.statLabel}>贷款申请数</Text>
          <Text className={styles.statTrend}>↑ 较上月 +15.8%</Text>
        </View>
      </View>

      <View className={styles.chartCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📈 近7日交易趋势</Text>
          <Text className={styles.moreBtn}>查看详情 →</Text>
        </View>
        <View className={styles.barChart}>
          {data.dailyDealsTrend.map((val, i) => {
            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            const height = (val / maxDeals) * 100;
            return (
              <View key={i} className={styles.barItem}>
                <View className={styles.barFill} style={{ height: `${height}%` }}>
                  <Text className={styles.barValue}>{val}</Text>
                </View>
                <Text className={styles.barLabel}>{days[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.predictionCard}>
        <Text className={styles.sectionTitle}>🔮 AI热门车型预测</Text>
        {predictions.hotModels.map((model, i) => (
          <View key={model.model} className={styles.predictionItem}>
            <View className={styles.predictionRank}>{i + 1}</View>
            <Text className={styles.predictionModel}>{model.model}</Text>
            <Text className={classnames(styles.predictionTrend, model.trend < 0 && styles.down)}>
              {model.trend > 0 ? '↑' : '↓'} {Math.abs(model.trend)}%
            </Text>
            <View className={styles.predictionScore}>热度 {model.score}</View>
          </View>
        ))}
      </View>

      <View className={styles.chartCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🏆 品牌成交量排行</Text>
          <Text className={styles.moreBtn}>全部排行 →</Text>
        </View>
        <View className={styles.rankList}>
          {data.brandStats.map((brand, i) => (
            <View key={brand.brand} className={styles.rankItem}>
              <View className={classnames(styles.rankNum, i < 3 && styles[`top${i + 1}`])}>{i + 1}</View>
              <View className={styles.rankContent}>
                <View className={styles.rankHeader}>
                  <Text className={styles.rankName}>{brand.brand}</Text>
                  <Text className={styles.rankValue}>
                    {brand.count}辆 · ¥{(brand.revenue / 10000).toFixed(0)}万
                  </Text>
                </View>
                <View className={styles.rankBar}>
                  <View
                    className={styles.rankFill}
                    style={{ width: `${(brand.revenue / maxBrandRevenue) * 100}%` }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.chartCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📍 城市车源分布</Text>
        </View>
        <View className={styles.rankList}>
          {data.cityStats.map((city, i) => (
            <View key={city.city} className={styles.rankItem}>
              <View className={classnames(styles.rankNum, i < 3 && styles[`top${i + 1}`])}>{i + 1}</View>
              <View className={styles.rankContent}>
                <View className={styles.rankHeader}>
                  <Text className={styles.rankName}>{city.city}</Text>
                  <Text className={styles.rankValue}>{city.count}辆</Text>
                </View>
                <View className={styles.rankBar}>
                  <View
                    className={styles.rankFill}
                    style={{ width: `${(city.count / maxCityCount) * 100}%` }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.chartCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>💰 二手车均价走势</Text>
        </View>
        <View className={styles.barChart}>
          {predictions.priceTrend.map((item, i) => {
            const max = Math.max(...predictions.priceTrend.map(p => p.price));
            const min = Math.min(...predictions.priceTrend.map(p => p.price));
            const height = ((item.price - min + 0.5) / (max - min + 1)) * 100;
            return (
              <View key={i} className={styles.barItem}>
                <View className={styles.barFill} style={{ height: `${height}%` }}>
                  <Text className={styles.barValue}>{item.price}万</Text>
                </View>
                <Text className={styles.barLabel}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.exportCard}>
        <View className={styles.exportInfo}>
          <Text className={styles.exportTitle}>📄 月度运营报表</Text>
          <Text className={styles.exportDesc}>
            包含品牌成交量、营收、金融渗透率、用户满意度
          </Text>
        </View>
        <Button className={styles.exportBtn} onClick={handleExport}>
          导出报表
        </Button>
      </View>
    </View>
  );
};

export default AdminPage;

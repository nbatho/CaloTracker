import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  useColorScheme,
} from "react-native";
import { BarChart, StackedBarChart } from "react-native-chart-kit";
import { useDispatch, useSelector } from "react-redux";
import { loadWeekData, loadMonthData, loadYearData } from "@/components/redux/diarySlice";
import BMICircle from "@/components/BMI_Circle";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0,122,255,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const Graph = () => {
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  const [selectedRange, setSelectedRange] = useState("weekly");
  const dispatch = useDispatch();

  const weekData = useSelector((state) => state.diary.weekData);
  const monthData = useSelector((state) => state.diary.monthData);
  const yearData = useSelector((state) => state.diary.yearData);
  const userData = useSelector(state => state.diary.userData);

  const height = useMemo(() => userData?.height || 0, [userData]);
  const weight = useMemo(() => userData?.weight || 0, [userData]);
  
  useEffect(() => {
    if (!weekData) dispatch(loadWeekData());
    if (!monthData) dispatch(loadMonthData());
    if (!yearData) dispatch(loadYearData());
  }, []);
  
  const calculateBMI = (weight, height) => height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : 0;
  const BMI = useMemo(() => parseFloat(calculateBMI(weight, height)), [weight, height]);

  const processData = (data, groupBy) => {
    if (!data) return { labels: ["No Data"], calorieData: [0], fatData: [0], carbsData: [0], proteinData: [0] };
    const result = { labels: [], calorieData: [], fatData: [], carbsData: [], proteinData: [] };

    const aggregatedData = Object.keys(data).reduce((acc, dateStr) => {
      let key = groupBy === "week" ? `W${Math.ceil(new Date(dateStr).getDate() / 7)}` 
                : groupBy === "month" ? new Date(dateStr).getMonth() + 1 
                : dateStr.split("-")[2];
      if (!acc[key]) acc[key] = { calorie: 0, fat: 0, carbs: 0, protein: 0 };
      data[dateStr].forEach((item) => {
        if (item) {
          acc[key].calorie += parseFloat(item.met || 0);
          acc[key].fat += parseFloat(item.fat || 0);
          acc[key].carbs += parseFloat(item.carbohydrates || 0);
          acc[key].protein += parseFloat(item.proteins || 0);
        }
      });
      return acc;
    }, {});

    Object.entries(aggregatedData).forEach(([key, value]) => {
      result.labels.push(key);
      result.calorieData.push(value.calorie);
      result.fatData.push(value.fat);
      result.carbsData.push(value.carbs);
      result.proteinData.push(value.protein);
    });

    return result;
  };

  const processedData = useMemo(() => {
    return selectedRange === "weekly" ? processData(weekData, "day") 
         : selectedRange === "monthly" ? processData(monthData, "week") 
         : processData(yearData, "month");
  }, [selectedRange, weekData, monthData, yearData]);

  const barChartData = useMemo(() => ({
    labels: processedData.labels,
    datasets: [{ data: processedData.calorieData.map((v) => Math.max(v, 0)) }]
  }), [processedData]);

  const stackedData = useMemo(() => ({
    labels: processedData.labels,
    legend: ["Fat", "Carbs", "Protein"],
    data: processedData.labels.map((_, i) => [
      processedData.fatData[i] || 0,
      processedData.carbsData[i] || 0,
      processedData.proteinData[i] || 0
    ]),
    barColors: ["#FF6384", "#36A2EB", "#FFCE56"]
  }), [processedData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <Text style={styles.header}>Insights</Text>
      <View style={styles.tabsContainer}>
        {["weekly", "monthly", "yearly"].map((item) => (
          <Pressable key={item} onPress={() => setSelectedRange(item)}
            style={[styles.tabButton, selectedRange === item && styles.tabButtonSelected]}>
            <Text style={[styles.tabText, selectedRange === item && styles.tabTextSelected]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.chartTitle}>Calorie (kcal)</Text>
      <BarChart data={barChartData} width={screenWidth - 30} height={220} chartConfig={chartConfig} style={styles.chart} />
      <Text style={styles.chartTitle}>Nutrition (g)</Text>
      <StackedBarChart data={stackedData} width={screenWidth - 30} height={220} chartConfig={chartConfig} style={styles.chart} />
      <View style={[styles.bmiContainer, styles.chart]}>
        <BMICircle bmi={BMI} size={300} />
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  tabsContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: "#a1ce50ff" },
  tabButtonSelected: { backgroundColor: "#a1ce50ff" },
  tabText: { fontSize: 16, fontWeight: "bold", color: "#a1ce50ff" },
  tabTextSelected: { color: "#fff" },
  chart: { borderRadius: 10 }
});

export default Graph;

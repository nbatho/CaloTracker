import React, { useState, useEffect } from "react";
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

const Graph = () => {
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";

  const [selectedRange, setSelectedRange] = useState("weekly");
  const dispatch = useDispatch();

  const weekData = useSelector((state) => state.diary.weekData);
  const monthData = useSelector((state) => state.diary.monthData);
  const yearData = useSelector((state) => state.diary.yearData);

  // weight, height
  const userData = useSelector(state => state.diary.userData);
  const height = userData?.height || 0;
  const weight = userData?.weight || 0;
  // tinh BMI
  const calculateBMI = (weight, height) => {
    if (height > 0) {
      return (weight / ((height / 100) ** 2)).toFixed(1);
    }
    return 0;
  };
  const BMI = parseFloat(calculateBMI(weight, height));
  useEffect(() => {
    if (!weekData || Object.keys(weekData).length === 0) {
      dispatch(loadWeekData());
    }
    if (!monthData || Object.keys(monthData).length === 0) {
      dispatch(loadMonthData());
    }
    if (!yearData || Object.keys(yearData).length === 0) {
      dispatch(loadYearData());
    }
  }, [dispatch, weekData, monthData, yearData]);
  
  const processData = (data, startDate, endDate, groupBy = "day") => {
    if (!data || Object.keys(data).length === 0) {
      // Return default data with at least one valid entry
      return { 
        labels: ["No Data"], 
        calorieData: [0], 
        fatData: [0], 
        carbsData: [0], 
        proteinData: [0] 
      };
    }
  
    const result = {
      labels: [],
      calorieData: [],
      fatData: [],
      carbsData: [],
      proteinData: [],
    };
  
    const tempData = {};
  
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);
  
    while (currentDate <= finalDate) {
      const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
      let key;
      if (groupBy === "week") {
        key = `W${Math.ceil(currentDate.getDate() / 7)}`;
      } else if (groupBy === "month") {
        key = `${currentDate.getMonth() + 1}`;
      } else {
        key = dateStr.split("-")[2];
      }
  
      if (!tempData[key]) {
        tempData[key] = { calorie: 0, fat: 0, carbs: 0, protein: 0 };
      }
  
      if (data[dateStr]) {
        const entries = data[dateStr];
        let flatData = [];
        
        // Handle different possible data structures
        if (Array.isArray(entries)) {
          flatData = entries.filter(Boolean);
        } else if (typeof entries === 'object') {
          // Flatten nested objects/arrays
          Object.values(entries).forEach(value => {
            if (Array.isArray(value)) {
              flatData = flatData.concat(value.filter(Boolean));
            } else if (value && typeof value === 'object') {
              flatData.push(value);
            }
          });
        }
        
        const roundTo1 = (num) => Math.round(num * 10) / 10;

        if (flatData.length > 0) {
          tempData[key].calorie = roundTo1(
            tempData[key].calorie + flatData.reduce((total, item) => {
              const met = item && item.met ? parseFloat(item.met) : 0;
              return total + (isNaN(met) ? 0 : met);
            }, 0)
          );
          
          tempData[key].fat = roundTo1(
            tempData[key].fat + flatData.reduce((total, item) => {
              const fat = item && item.fat ? parseFloat(item.fat) : 0;
              return total + (isNaN(fat) ? 0 : fat);
            }, 0)
          );
          
          tempData[key].carbs = roundTo1(
            tempData[key].carbs + flatData.reduce((total, item) => {
              const carbs = item && item.carbohydrates ? parseFloat(item.carbohydrates) : 0;
              return total + (isNaN(carbs) ? 0 : carbs);
            }, 0)
          );
          
          tempData[key].protein = roundTo1(
            tempData[key].protein + flatData.reduce((total, item) => {
              const protein = item && item.proteins ? parseFloat(item.proteins) : 0;
              return total + (isNaN(protein) ? 0 : protein);
            }, 0)
          );
        }
      }
  
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    // Convert tempData to arrays
    const sortedKeys = Object.keys(tempData).sort((a, b) => {
      const numA = parseInt(a.replace("W", ""), 10);
      const numB = parseInt(b.replace("W", ""), 10);
      return numA - numB;
    });
    
    sortedKeys.forEach((key) => {
      result.labels.push(key);
      result.calorieData.push(tempData[key].calorie);
      result.fatData.push(tempData[key].fat);
      result.carbsData.push(tempData[key].carbs);
      result.proteinData.push(tempData[key].protein);
    });
    
    // Ensure we have at least one data point
    if (result.labels.length === 0) {
      result.labels = ["No Data"];
      result.calorieData = [0];
      result.fatData = [0];
      result.carbsData = [0];
      result.proteinData = [0];
    }
  
    return result;
  };
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Process data based on selection
  const { labels, calorieData, fatData, carbsData, proteinData } = 
    selectedRange === "weekly"
      ? processData(weekData, startOfWeek, today, "day")
      : selectedRange === "monthly"
      ? processData(monthData, startOfMonth, endOfMonth, "week")
      : processData(yearData, new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), "month");

  // Prepare data for charts
  const barChartData = {
    labels: labels,
    datasets: [
      {
        data: calorieData.map(value => Math.max(value, 0)) // Ensure no negative values
      }
    ]
  };
  
  // Create proper data structure for StackedBarChart
  // StackedBarChart expects data in a very specific format
  const stackedData = {
    labels: labels,
    legend: ["Fat", "Carbs", "Protein"],
    data: labels.map((_, i) => [
      fatData[i] || 0,
      carbsData[i] || 0,
      proteinData[i] || 0
    ]),
    barColors: ["#FF6384", "#36A2EB", "#FFCE56"]
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Insights</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["weekly", "monthly", "yearly"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setSelectedRange(item)}
            style={[styles.tabButton, selectedRange === item && styles.tabButtonSelected]}
          >
            <Text style={[styles.tabText, selectedRange === item && styles.tabTextSelected]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Calorie Chart */}
      <Text style={styles.chartTitle}>Calorie (kcal)</Text>
      <BarChart
        data={barChartData}
        width={screenWidth - 30}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        style={styles.chart}
      />
      
      {/* Nutrition Chart */}
      <Text style={styles.chartTitle}>Nutrition (g)</Text>
      <StackedBarChart
        data={stackedData}
        width={screenWidth - 30}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />
      <Text style={styles.chartTitle}>BMI (kg/m2) </Text>
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <BMICircle bmi={BMI} size={300} />
      </View>
    </ScrollView>
  );
};

// Chart configuration
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0,122,255,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, marginTop: 20 },
  tabsContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: "#a1ce50ff" },
  tabButtonSelected: { backgroundColor: "#a1ce50ff" },
  tabText: { fontSize: 16, fontWeight: "bold", color: "#a1ce50ff" },
  tabTextSelected: { color: "#fff" },
  chart: { borderRadius: 10 },
});

export default Graph;
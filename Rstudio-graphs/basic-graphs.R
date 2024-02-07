getwd()

options(digits=3)

setwd("C:\\Users\\Parrot\\data-analyysi1\\visualisointi\\Rstudio-graphs\\")
getwd()


# 30.1.2024
# basic graphs and stats using R


# download iris database into the working directory
data(iris)
summary(iris)



# histogram of "setosa" species petal length
setosa_data = iris[iris$Species=="setosa", "Petal.Length"]
summary(setosa_data)

hist(setosa_data, main="Kaunokurjenmiekkojen terälehtien pituus", xlab="Terälehden pituus", ylab="Frekvenssi", col="blue", breaks=seq(min(setosa_data),max(setosa_data),by=0.1))
min(setosa_data)
max(setosa_data)


# boxplot of all iris species petal width
petal_width_data = iris[, c("Species", "Petal.Width")]
colors = c("setosa" = "lightblue", "versicolor" = "limegreen", "virginica" = "pink")
boxplot(Petal.Width ~ Species, data = petal_width_data, main="Terälehden leveys lajeittain", ylab = "Terälehden leveys", xlab = "Laji", col = colors)
unique(petal_width_data$Species)


# calculate statistical numbers based on a list of grades of students
arvosanat <- c(3, 4, 1, 4, 4, 3, 2, 4, 3, 0, 4, 3, 2, 4, 4, 3, 2, 3, 3, 4, 4, 2, 3, 1, 5, 4, 3, 2,
               2, 1, 2, 3, 1, 3, 4, 2, 2, 2, 2, 3, 1, 4, 0, 1, 5, 4, 3, 2, 2, 0, 2, 4, 3, 1, 2, 4,
               4, 3, 1, 2, NA, 3, 3, 1, 3, 2, 3, 4, 4, 1, 4, 3, 3, 1, 2, 2, 5, 3, NA, 5, 1, 2, 5, 2,
               3, 4, 1, 2, 5, 1, 2, 4, 1, 2, 4, 3, 3, 0, 2, 4, 5)


clean_grades = arvosanat[!is.na(arvosanat)]
arvosanat
clean_grades

  # calculate frequences, also NA
  freqs = table(arvosanat, useNA = "always")
  freqs
  length(arvosanat)
  
  2/101
  
  sum = sum(clean_grades)
  mean = mean(clean_grades)
  variance = var(clean_grades)
  SD = sd(clean_grades)
  median = median(clean_grades)
  
  sum
  mean
  variance
  SD
  median
  
  # sum, sample mean, sample variance, sample SD, median
  print("sum:", sum)
  print("mean:", mean)
  
  sqrt(variance)
  
  
  
# basic statistical numbers
  
options(digits=10)

dataset = c(50.738, 50.647, 49.8, 49.915, 50.349, 46.845, 51.1, 48.614, 49.899, 48.39, 50.25, 48.566, 49.522, 50.186,
49.55, 49.237, 49.697, 50.922, 48.973, 48.768, 52.266, 49.575, 49.227, 50.625, 49.326, 49.465, 50.529)

clean_data = dataset[!is.na(dataset)]
clean_data

minimum = min(clean_data)
maximum = max(clean_data)
vaihteluvali = max(clean_data) - min(clean_data)
alakvartiili = quantile(clean_data, 0.25)
ylakvartiili = quantile(clean_data, 0.75)
median1 = median(clean_data)

minimum
maximum
vaihteluvali
alakvartiili
median1
ylakvartiili


# calculate next descriptive statistics: 
# arithmetic mean, median, sample variance, sample SD

options(digits=10)

dataset = c(14.1, 5.2, 5.7, 5.5, 11.2, 10.7, 8.6, 24.6, 6.0, 7.8)
dataset

mean2 = signif(mean(dataset), 3)
median2 = signif(median(dataset), 3)
variance2 = signif(var(dataset), 3)
sd2 = signif(sd(dataset), 3)

mean2
median2
variance2
sd2

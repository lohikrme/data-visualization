# estimations
# 13.2.2024

options(digits = 10)

getwd()
setwd("C:\\Users\\Parrot\\data-analyysi1\\visualisointi\\Rstudio-graphs\\")
getwd()

dataset1 = c(20.0, 18.6, 18.9, 19.3, 19.5, 19.2, 20.1, 20.2, 19.4, 18.8, 18.2, 
             19.4, 19.6, 20.1, 19.3, 18.7, 20.3, 19.5, 19.6, 19.7, 20.5, 18.6, 
             18.9, 19.3, 19.5, 19.2, 20.1, 20.2, 19.4, 18.8, 18.2, 19.4, 19.6, 
             20.1, 19.3, 18.7, 20.3, 19.5, 19.6, 19.7)

# laske keskiarvo, hajonta
# anna vastaus kahden desimaalin tarkkuudella

mean1 = round(mean(dataset1), 2)
mean1

sd1 = round(sd(dataset1), 2)
sd1

sample_size1 = length(dataset1)
sample_size1

# laske 99% luottamusrajat samalle datasetille
# koska otoskoko on yli 30, mutta populaation keskihajonta on tuntematon
# käytetään studentin t-jakaumaa
# HUOM: R:ssä qt-funktio on oletusarvona 1-suuntainen
# eli jos kirjoittaa qt(0.975, df=9) tulee 2.26
# joka vastaa 0.025 yksisuuntaisessa taulukossa
# kun df=9 ja siten otoskoko = 9+1
# jos tehdään 2-suuntainen testi, pitäisi jakaa häntä 2:lla

conf_inter = function (keskiarvo, keskihajonta, luottamusvali, otoskoko) {
  percent = 1 - (1 - luottamusvali/100) / 2
  print(paste("percent: ", percent))
  T =  qt(percent, df = otoskoko - 1)
  print(paste("T-value:", T))
  print(paste("population SD:", keskihajonta))
  print(paste("sample SD:", keskihajonta / sqrt(otoskoko)))
  print(paste("standard error:", T * (keskihajonta / sqrt(otoskoko))))
  # mene T * keskihajontaa vasemmalle ja oikealle keskiarvosta
  pienin = round(keskiarvo - T * keskihajonta / sqrt(otoskoko), 2)
  suurin = round(keskiarvo + T * keskihajonta / sqrt(otoskoko), 2)
  
  return (c(pienin, suurin))
}

conf_inter(mean1, sd1, 99, sample_size1)




# kyselytutkimuksessa kysytään 2300 ihmiseltä mielipide
# 628 kannatti poliitikon ajamaa asiaa
# poliitikko sanoo, että 30 prosenttia kansasta kannattaa
# määritä otoksesta 95 ja 99% luottamusvälit, ja sen perusteella
# määrittele, pitääkö poliitikon väite paikkansa

# käytän Z-taulukkoa, koska puhutaan isoista otoksista
# ja koska kyse on 2 suuntaisesta, 
# niin 95% tarkoittaa 2.5% häntiä
#ja 99% tarkoittaa 0.5% häntiä
# eli R-komentoina qnorm(0.975) ja qnorm(0.995)

# keskihajonta lasketaan binomijakauman mukaisesti 
# yhden tilastoyksikön eli yhden ihmisen sd on sqrt(p*q)
# mutta nyt on otos, mitä isompi otos, sitä pienempi sd
# sd kapenee jakamalla sqrt(n)
# eli lopullinen lasku on:
# sqrt(p*q) / sqrt(n)

options(digits = 10)

sample_size = 2300
support = 628/2300


conf_interv_percents = function (support, sample_size, confidence_interval) {
  print(paste("support", support))
  print(paste("opposition", 1-support))
  print(paste("sample_size", sample_size))
  sd = sqrt(support*(1-support))
  print(paste("sd", sd))
  sample_sd = sd / sqrt(sample_size)
  print(paste("sample_sd", sample_sd))
  how_many_sd_from_avg = qnorm(1-(1-confidence_interval/100)/2)
  print(paste("how_many_sd_from_avg", how_many_sd_from_avg))
  standard_error = sample_sd * how_many_sd_from_avg
  print(paste("standard_error", standard_error))
  
  # laske luottamusväli ja palauta se
  lower = round(support - standard_error, 3)
  higher = round(support + standard_error, 3)
  return (c(lower, higher))
}

conf_interv_percents(support, sample_size, 99)



# tehdas valmistaa ruuveja. ruuvien paino
# vaihtelee satunnaisesti normaalijakautuneesti
# otoskeskiarvo 18g. oletetaan (epärealistisesti)
# että normaalijakauman varianssi 0.16 g^2.
# määritä 95% luottamusvälit painon odotusarvolle
# jos otoskoko on a) 23 b) 2300

# koska 95% luottamusväli, tiedän, että keskihajontojen määrä
# vastaa sitä. Koska normaalijakauman varianssi ja 
# siten myös keskihajonta ovat tunnettuja
# Pienemmässä otos on alle 30, eli käytän T-testiä
# isommassa otos on yli 30 ja popkeskihajonta tunnettu eli Z-testi'

# keskivirhe eli keskihajontojen pituus saadaan
# varianssista. pitää vain ottaa huomioon otoskoko

options(digits = 10)

Z = qnorm(0.975)
sd = sqrt(0.16)
average = 18


conf_Z = function (Z, sd, average, sample_size) {
  sample_sd = sd/sqrt(sample_size)
  low = signif(average - Z * sample_sd, 4)
  high = signif(average + Z * sample_sd, 4)
  return (c(low, high))
}

conf_Z(Z, sd, average, 2300)

# pienemmän otoksen laskun lasken T-testillä koska alle 30 otos:

conf_T = function (sd, average, sample_size) {
  sample_sd = sd/sqrt(sample_size)
  T = qt(0.975, sample_size - 1)
  low = signif(average - T * sample_sd, 4)
  high = signif(average + T * sample_sd, 4)
  return (c(low, high))
}

conf_T(sd, average, 23)



# normaalisti jakautuneesta suureesta 30kpl otos
# otoksen keskiarvo 12.4, otoksen hajonta 1.4

# ensin lasken 99% luottamusvälin perusjoukon keskiarvolle
# koska ei tunneta pop keskihajontaa, käytän T-testiä

options(digits = 10)

sample_size = 30
sd = 1.4
sample_sd = sd/sqrt(sample_size)
mean = 12.4
T = qt(0.995, df = sample_size - 1)
lower = round(mean - T * sample_sd, 2)
higher = round(mean + T * sample_sd, 2)
print(paste("lower", lower, "higher", higher))


# sitten lasken, kuinka iso otoskoko pitäisi olla, jotta
# luottamusväli 99.9% olisi keskiarvo +- 0.1mm
# tehtävässä sanotaan, että perusjoukon hajotna olisi 1.4mm
# mikä mahdollistaa laskea, otoshajonnalla ei voisi laskea

# kaavana toimii: E = Z * pikku_sigma/sqrt(n).
# E tarkoittaa siis keskivirhettä, pituutta keskiarvosta reunaan
# tapauksessamme haluamme, että E = 0.1mm
# mutta tähän tarkoitukseen se käännetään muotoon:
# n = ((Z * pikku_sigma)/E)^2


Z = qnorm(0.9995)
pikku_sigma = 1.4
n = ceiling(((Z * pikku_sigma)/0.1)^2)
n


# galluppiin osallistui 3000 haastateltavaa
# 2115 vastasi kyllä
# laske kyllä-vastanneiden prosenttiosuuden 
# 95% luottamusrajat eli virhemarginaali

# yhden ihmisen p on 2115/3000 ja q on 1 - 2115/3000
# josta siis tulee keskihajonta sqrt(p*q)
# koska otoksen koko on 3000, otoskeskihajonnaksi
# tulee sqrt(p*q) / sqrt(3000)
# sen jälkeen käytetään Z-taulukkoa 95%

options(digits = 10)

conf_inter = function (support, sample_size, conf_interval) {
  p = support/sample_size
  q = 1 - p
  sample_sd = sqrt(p*q) / sqrt(sample_size)
  tail = (1-conf_interval/100)/2
  Z = qnorm(1-tail)
  standard_error = Z * sample_sd
  mean = p
  lower = round((mean - standard_error) * 100, 1)
  higher = round((mean + standard_error) * 100, 1)
  return (c(lower, higher))
  
}

conf_inter(2115, 3000, 95)



# estimoitaessa normaalisti N(μ ; 2.2) jakautuneen
# sarunnaisuureen odotusarvoa μ, otetaan n kpl otos.
# Kuinka suuri otos on valittava, että μ:n
# 99%:n luottamusvälin pituus ei ole suurempi kuin 1.5

# Todettakoon ensiksi, että N(μ ; 2.2) tarkoittaa siis
# normaalijakautunutta dataa, jossa odotusarvo on tuntematon
# ja jossa keskihajonta pikku_sigma on 2.2

# Tässä kysytään luottamusvälin pituutta, eli käytetään kaavaa
# E = Z * pikku_sigma/sqrt(n)
# jossa E tarkoittaa virhemarginaalin pituutta
# virhemarginaalia voisi kutsua myös hännäksi, koska
# E on luottamusvälin puolikkaan pituus
# Siis jos on vaikka keskiarvo 100, SD 2, luottamusväli 95%
# Niin silloin E = Z(0.975) * 2 = 1.96 * 2 = 3.92
# Eli kun tehtävänannossa sanotaan, luottamusvälin pituus pitää olla
# 1.5mm, se tarkoittaa, että E eli virhemarginaali pitää olla 
# 1.5mm / 2 = 0.75mm suuntaansa

# tämän voi ratkaista kaavalla: n = ((Z * pikku_sigma)/E)^2 lasketaan


Z = qnorm(0.995) 
sd = 2.2
E = 1.5 / 2 
n = ceiling((Z * sd / E)^2) 
print(paste("Sample size:", n))




# Heikki mittasi lepopulssiaan ja sai seuraavan otoksen:
# 67, 62, 58, 74, 65, 66, 63
# määritä 95% luottamusväli Heikin 
# keskimääräiselle lepopulssille
# anna vastaus yhden desimaalin tarkkuudella

dataset = c(67, 62, 58, 74, 65, 66, 63)
mean = mean(dataset)
sample_size = length(dataset)
sd = sd(dataset)
sample_sd = sd / sqrt(sample_size)
T = qt(0.975, df = sample_size - 1)

lower = round(mean - T * sample_sd, 1)
higher = round(mean + T * sample_sd, 1)

print(paste("Lower:", lower, "Higher:", higher))



# Internetgallupissa 1500 suomalaiselta kysyttiin, 
# onko heillä ilmalämpöpumppu. 52.9% sanoi omistavansa.
# Määritä 95% luottamusväli ilmalämpöpumpun omistavien
# suhteelliselle osuudelle. 
# Anna vastaus prosentteina 1 desimaalin tarkkuudella

sample_size = 1500
owners = 0.529
q = 1 - owners
Z = qnorm(0.975)
sd = sqrt(owners * q)
sample_sd = sd / sqrt(sample_size)
mean = owners

lower = round((mean - Z * sample_sd)*100, 1)
higher = round((mean + Z * sample_sd)*100, 1)

print(paste("Lower:", lower, "Higher:", higher))



# short test about R's 'sd()' function
testdata = c(20.0, 18.6, 18.9, 19.3, 19.5, 19.2, 20.1, 20.2, 19.4, 18.8, 18.2, 
             19.4, 19.6, 20.1, 19.3, 18.7, 20.3, 19.5, 19.6, 19.7, 20.5, 18.6, 
             18.9, 19.3, 19.5, 19.2, 20.1, 20.2, 19.4, 18.8, 18.2, 19.4, 19.6, 
             20.1, 19.3, 18.7, 20.3, 19.5, 19.6, 19.7)

# divide with n-1
mean = mean(testdata)
sample_size = length(testdata)
variance = sum((testdata - mean)^2 / (sample_size - 1))
standard_deviation = sqrt(variance)
standard_deviation

# divide with n
variance2 = sum((testdata - mean)^2 / (sample_size))
standard_deviation2 = sqrt(variance2)
standard_deviation2

# use inbuilt sd function
sd(testdata)



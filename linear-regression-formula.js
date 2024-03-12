
//----------------- TEORIAA ---------------------------------------------------------
      // lineaarinen regressio lasketaan y = mx + b 
      // eli (ennustettava arvo) = (kulmakerroin * selittävä arvo) + vakiotermi

      // kulmakerroin lasketaan kaavalla: 
        // kulmakerroin = SIGMA { (x - x:n keskiarvo) * (y - y:n keskiarvo) } / SIGMA { (x - x:n keskiarvo)^2 }
        // HUOM. kaavassa x = selittävä ja y = ennustettava data

      // vakiotermi lasketaan kaavalla 
      // vakiotermi = (y:n keskiarvo) - (kulmakerroin * x:n keskiarvo)


//---------------- THEORY ------------------------------ --------------------------
       // linear regression is calculated y = mx + b
       // ie (predicted value) = (slope * explanatory value) + constant term

       // the slope is calculated using the formula:
         // slope = SIGMA { (x - mean of x) * (mean of y - y) } / SIGMA { (mean of x - x)^2 }
         // NOTE in the formula, x = explanatory and y = predictive data

       // the constant term is calculated with the formula 
       // constant = (average of y) - (slope * average of x)


       
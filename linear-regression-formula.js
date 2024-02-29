
//----------------- TEORIAA ---------------------------------------------------------
      // lineaarinen regressio lasketaan y = mx + b 
      // eli (ennustettava arvo) = (kulmakerroin * selittävä arvo) + vakiotermi

      // kulmakerroin lasketaan kaavalla: 
        // SIGMA { (x - x:n keskiarvo) * (y - y:n keskiarvo) } / SIGMA { (x - x:n keskiarvo)^2 }
        // HUOM. kaavassa x = selittävä ja y = ennustettava data

      // vakiotermi lasketaan kaavalla b = (y:n keskiarvo) - (kulmakerroin * x:n keskiarvo)


//---------------- THEORY ------------------------------ --------------------------
       // linear regression is calculated y = mx + b
       // ie (predicted value) = (slope * explanatory value) + constant term

       // the slope is calculated using the formula:
         // SIGMA { (x - mean of x) * (mean of y - y) } / SIGMA { (mean of x - x)^2 }
         // NOTE in the formula, x = explanatory and y = predictive data

       // the constant term is calculated with the formula b = (average of y) - (slope * average of x)
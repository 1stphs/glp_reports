#' Nomogram Analysis Module
#' 
#' Generates Nomograms for clinical prediction models using rms.
#' Dependencies: rms, Hmisc

library(rms)
library(Hmisc)

source("R/io_utils.R")

#' Draw Nomogram
#' 
#' Fits a Logistic/Cox model and draws the nomogram.
#' 
#' @param config_list A named list containing 'data_payload' (patient data) and 'model_config'.
#' @return A plot object.
#' @export
draw_nomogram <- function(config_list) {
  validate_config(config_list)
  
  df <- parse_data_payload(config_list$data_payload)
  
  # rms requires 'datadist' to be set globally
  dd <- datadist(df)
  options(datadist = "dd")
  
  # Construct Formula
  # config: {"outcome": "status", "predictors": ["age", "sex", "bmi"]}
  outcome <- config_list$model_config$outcome
  predictors <- paste(config_list$model_config$predictors, collapse = " + ")
  f_str <- paste(outcome, "~", predictors)
  
  # Fit Model (Logistic Regression example)
  # In a full version, we'd support 'lrm', 'cph', etc.
  model_type <- if(!is.null(config_list$model_config$type)) config_list$model_config$type else "logistic"
  
  fit <- NULL
  if (model_type == "logistic") {
    fit <- lrm(as.formula(f_str), data = df, x=TRUE, y=TRUE)
  } else if (model_type == "cox") {
    # Expects outcome to be Surv object? Complex for simple JSON.
    # For MVP stick to simple response
    stop("Cox model support pending in MVP")
  }
  
  # Plot
  # fun=plogis converts log-odds to probability
  nom <- nomogram(fit, fun=plogis, funlabel="Probability")
  
  plot(nom)
}

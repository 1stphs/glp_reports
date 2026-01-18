#' Diagnostic & Evaluation Module
#' 
#' Generates ROC Curves and Calibration plots.
#' Dependencies: pROC, ggplot2

library(pROC)
library(ggplot2)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw ROC Curve
#'
#' @param config_list Configuration list.
#' @return A ggplot object.
#' @export
draw_roc_curve <- function(config_list) {
  validate_config(config_list)
  df <- parse_data_payload(config_list$data_payload)
  style <- config_list$style_config
  
  # Data: 'response' (0/1), 'predictor' (continuous score)
  # If multiple predictors, we might need multiple ROCs (advanced).
  # MVP: Single curve
  
  resp_col <- config_list$model_config$response
  pred_col <- config_list$model_config$predictor
  
  roc_obj <- roc(df[[resp_col]], df[[pred_col]], quiet = TRUE)
  
  auc_val <- auc(roc_obj)
  auc_label <- sprintf("AUC = %.3f", auc_val)
  
  # Use pROC::ggroc for easy ggplot integration using ggplot2
  p <- ggroc(roc_obj, 
             legacy.axes = TRUE, # 1-Specificity on X axis
             color = get_palette(style$journal_theme)[1],
             size = 1) +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", color = "grey") +
    
    annotate("text", x = 0.75, y = 0.25, label = auc_label, size = 5) +
    
    labs(x = "1 - Specificity", y = "Sensitivity") +
    get_journal_theme(style$journal_theme)
  
  if (!is.null(style$smooth) && style$smooth) {
    # pROC supports smoothing, but ggroc plots the object directly.
    # To smooth, we'd smooth the object first: 
    # roc_smooth <- smooth(roc_obj)
    # p <- ggroc(roc_smooth, ...)
  }

  return(p)
}

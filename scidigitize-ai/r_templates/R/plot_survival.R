#' Survival Analysis Module
#' 
#' Generates Kaplan-Meier curves using survminer.
#' Dependencies: survival, survminer, ggplot2

library(survival)
library(survminer)
library(ggplot2)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Survival Plot
#'
#' Logic: Data -> Surv Object -> Fit -> ggsurvplot -> Theme customization.
#' 
#' @param config_list A named list containing 'style_config' and 'data_payload'.
#' @return A ggsurvplot object.
#' @export
draw_survival_plot <- function(config_list) {
  
  # 1. Validation rule for this specific module
  validate_config(config_list)
  
  # 2. Parse Data
  # Data payload must have 'time', 'status', 'strata' (optional)
  raw_df <- parse_data_payload(config_list$data_payload)
  
  print("Debug raw_df names:")
  print(names(raw_df))
  print(head(raw_df))
  
  # Normalize names to lowercase for robustness
  names(raw_df) <- tolower(names(raw_df))
  
  # Check required columns
  if (!"time" %in% names(raw_df)) stop("Missing required column: 'time' (found: ", paste(names(raw_df), collapse=", "), ")")
  # Status might be optional if we assume all event, but for survival plot usually needed. 
  # If missing, maybe default to 1? Let's error for now to be safe.
  if (!"status" %in% names(raw_df)) {
     print("Warning: 'status' column missing. Defaulting to 1 (Event) for all.")
     raw_df$status <- 1
  }
  
  # Ensure columns are numeric/factor
  raw_df$time <- as.numeric(raw_df$time)
  raw_df$status <- as.numeric(raw_df$status) # 0=censored, 1=event usually
  
  if (!"strata" %in% names(raw_df)) {
    raw_df$strata <- "All"
  }
  
  # 3. Fit Survival Model
  fit <- survfit(Surv(time, status) ~ strata, data = raw_df)
  
  # 4. Extract configs
  style <- config_list$style_config
  
  journal_theme <- if(!is.null(style$journal_theme)) style$journal_theme else "NEJM"
  palette <- get_palette(journal_theme)
  
  # Overwrite palette if specific custom colors provided
  # Overwrite palette if specific custom colors provided
  if (!is.null(style$custom_palette) && length(style$custom_palette) > 0) {
    palette <- style$custom_palette
  }
  
  show_risk_table <- if(!is.null(style$risk_table$show)) style$risk_table$show else TRUE
  show_pval <- if(!is.null(style$p_value_annotation$show)) style$p_value_annotation$show else TRUE
  censor_shape <- if(!is.null(style$censoring_mark)) style$censoring_mark else "+"
  break_time_by <- if(!is.null(style$break_time_by)) style$break_time_by else NULL
  
  # Font mapping for R
  r_font <- "sans"
  if (!is.null(style$font_family)) {
    if (style$font_family == "Times New Roman") r_font <- "serif"
    if (style$font_family == "Courier") r_font <- "mono"
  }

  # 5. Plotting (The Heavy Lifting)
  # ggsurvplot is the gold standard for this.
  
  p <- ggsurvplot(
    fit,
    data = raw_df,
    
    # Appearance
    palette = palette,
    ggtheme = get_journal_theme(journal_theme) + theme(text = element_text(family = r_font)),
    censor.shape = censor_shape,
    size = 1, # Line size, could be configurable
    
    # Risk Table
    risk.table = show_risk_table,
    risk.table.height = 0.25,
    risk.table.y.text.col = TRUE,
    risk.table.y.text = FALSE,
    fontsize = 4, # Risk table font size
    
    # Confidence Interval
    conf.int = TRUE, # Default to true, could be configurable
    conf.int.style = "ribbon",
    conf.int.alpha = 0.1,
    
    # P-Value
    pval = show_pval,
    pval.method = TRUE,
    pval.coord = c(0, 0.1), # Default position, should be dynamic in prod
    
    # Layout
    legend = "top",
    legend.title = "Group",
    legend.labs = levels(factor(raw_df$strata)),
    
    # Axis
    xlab = "Time",
    ylab = "Survival Probability",
    break.time.by = break_time_by
  )
  
  return(p)
}

#' Forest Plot Module
#' 
#' Generates Forest Plots using forestploter.
#' Dependencies: forestploter, grid

library(forestploter)
library(grid)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Forest Plot
#'
#' @param config_list A named list containing 'style_config' and 'data_payload'.
#' @return A grob object representing the forest plot.
#' @export
draw_forest_plot <- function(config_list) {
  
  validate_config(config_list)
  
  # 1. Parse Data
  # Expected columns: variable, level, estimate, low, high, p_val, etc.
  # The payload might also define which columns are "text" columns to display on the left.
  df <- parse_data_payload(config_list$data_payload)
  
  # 2. Key Configs
  style <- config_list$style_config
  
  # Indentation logic for subgroups (if 'level' column exists)
  if ("level" %in% names(df)) {
    df$variable <- ifelse(df$level == 1, 
                          paste0("  ", df$variable), 
                          df$variable)
  }
  
  # Define the layout for text columns
  # Default: Variable | Estimate (CI) | P-value
  # In forestploter, we supply the dataframe with text columns.
  
  # We construct a text-only dataframe for the table part
  # Assuming 'estimate_label' is pre-formatted in data payload or we format it here
  if (!"estimate_label" %in% names(df)) {
    df$estimate_label <- ifelse(
      is.na(df$estimate), "",
      sprintf("%.2f (%.2f-%.2f)", df$estimate, df$low, df$high)
    )
  }
  
  # Columns to display
  # This could be dynamic based on config
  display_cols <- c("variable", "estimate_label", "p_val")
  dt <- df[, display_cols, drop = FALSE]
  
  # Rename headers if provided
  if (!is.null(style$headers)) {
    names(dt) <- style$headers
  }
  
  # 3. Aesthetics
  journal_theme <- if(!is.null(style$journal_theme)) style$journal_theme else "NEJM"
  palette <- get_palette(journal_theme)
  main_color <- palette[1]
  
  ci_pch <- if(!is.null(style$ci_pch)) style$ci_pch else 15 # Square
  ref_line <- if(!is.null(style$ref_line)) style$ref_line else 1
  
  # 4. Plotting
  p <- forest(
    dt,
    est = df$estimate,
    lower = df$low, 
    upper = df$high,
    ci_column = 2, # Draw plot in the 2nd column (usually between label and pval, or adjust)
    ref_line = ref_line,
    arrow_lab = c("Favors Control", "Favors Treatment"), # Configurable?
    xlim = c(min(df$low, na.rm=TRUE), max(df$high, na.rm=TRUE)),
    ticks_at = NULL,
    
    theme = forest_theme(
      base_size = 10,
      base_family = "sans",
      ci_pch = ci_pch,
      ci_col = main_color,
      ci_lty = 1,
      ci_lwd = 1.5,
      refline_col = "grey50",
      refline_lty = "dashed",
      vertline_col = "grey90"
    )
  )
  
  return(p)
}

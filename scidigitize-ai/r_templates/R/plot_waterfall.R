#' Waterfall Plot Module
#' 
#' Generates Waterfall plots for mutation landscapes or response rates.
#' Uses ggplot2 for maximum flexibility with JSON inputs (mimicking maftools style).
#' Dependencies: ggplot2, dplyr

library(ggplot2)
library(dplyr)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Waterfall Plot
#'
#' @param config_list A named list containing 'style_config' and 'data_payload'.
#' @return A ggplot object.
#' @export
draw_waterfall_plot <- function(config_list) {
  
  validate_config(config_list)
  
  df <- parse_data_payload(config_list$data_payload)
  style <- config_list$style_config
  
  # Data expectation: 'sample_id', 'value' (e.g. % change), 'category' (e.g. mutation type or response)
  
  # 1. Sort Data (The "Waterfall" Effect)
  if (is.null(style$sort_direction) || style$sort_direction == "desc") {
    df <- df[order(df$value, decreasing = TRUE), ]
  } else {
    df <- df[order(df$value, decreasing = FALSE), ]
  }
  
  # Lock factor order to preserve sort
  df$sample_id <- factor(df$sample_id, levels = df$sample_id)
  
  # 2. Configs
  journal_theme <- if(!is.null(style$journal_theme)) style$journal_theme else "NEJM"
  
  # Custom colors map?
  # JSON: {"color_map": {"Missense": "green", "Nonsense": "black"}}
  color_values <- NULL
  if (!is.null(style$color_map)) {
    color_values <- unlist(style$color_map)
  } else {
    # Default palette fallback
    cats <- unique(df$category)
    base_pal <- get_palette(journal_theme)
    color_values <- setNames(rep(base_pal, length.out=length(cats)), cats)
  }
  
  # 3. Plotting
  p <- ggplot(df, aes(x = sample_id, y = value, fill = category)) +
    geom_bar(stat = "identity", width = 0.9) +
    
    # Optional: Cutoff lines (e.g., -30% for PR)
    geom_hline(yintercept = -30, linetype = "dashed", color = "grey50") +
    geom_hline(yintercept = 20, linetype = "dashed", color = "grey50") +
    
    scale_fill_manual(values = color_values) +
    
    labs(x = "Samples", y = "Change from Baseline (%)", fill = "Mutation/Response") +
    
    get_journal_theme(journal_theme) +
    theme(
      axis.text.x = element_blank(), # Hide X labels usually for waterfall
      axis.ticks.x = element_blank(),
      panel.grid.major.x = element_blank()
    )
  
  return(p)
}

#' Omics Visualization Module
#' 
#' Generates Volcano Plots for transcriptomics/genomics.
#' Implements a lightweight ggplot2 version of EnhancedVolcano philosophy.
#' Dependencies: ggplot2, ggrepel

library(ggplot2)
library(ggrepel)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Volcano Plot
#' 
#' @param config_list Configuration list.
#' @return A ggplot object.
#' @export
draw_volcano_plot <- function(config_list) {
  validate_config(config_list)
  df <- parse_data_payload(config_list$data_payload)
  style <- config_list$style_config
  
  # Data: 'log2FC', 'p_value', 'gene_symbol'
  # Configs: p_cutoff, fc_cutoff
  
  p_cutoff <- if(!is.null(style$p_cut)) style$p_cut else 0.05
  fc_cutoff <- if(!is.null(style$fc_cut)) style$fc_cut else 1.0
  
  # Categorize Significance
  df$Significance <- "NS"
  df$Significance[df$log2FC > fc_cutoff & df$p_value < p_cutoff] <- "Up"
  df$Significance[df$log2FC < -fc_cutoff & df$p_value < p_cutoff] <- "Down"
  
  # Colors
  cols <- c("Up" = "#BC3C29", "Down" = "#0072B5", "NS" = "grey70")
  # Or use theme palette
  
  # Plot
  p <- ggplot(df, aes(x = log2FC, y = -log10(p_value), color = Significance)) +
    geom_point(alpha = 0.6, size = 1.5) +
    scale_color_manual(values = cols) +
    
    # Threshold lines
    geom_vline(xintercept = c(-fc_cutoff, fc_cutoff), linetype="dashed", color="grey30") +
    geom_hline(yintercept = -log10(p_cutoff), linetype="dashed", color="grey30") +
    
    labs(x = "Log2 Fold Change", y = "-Log10 P-value") +
    get_journal_theme("NEJM") +
    theme(legend.position = "top")
  
  # Add Labels for Top hits
  # If 'label_top' is set to N
  if (!is.null(style$label_top_n)) {
    top_n <- style$label_top_n
    # Rank by p-value
    df_sorted <- df[order(df$p_value), ]
    top_genes <- head(df_sorted[df_sorted$Significance != "NS",], top_n)
    
    p <- p + geom_text_repel(data = top_genes, aes(label = gene_symbol), show.legend = FALSE)
  }
  
  return(p)
}

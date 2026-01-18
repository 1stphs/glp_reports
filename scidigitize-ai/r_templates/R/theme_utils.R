#' Core Theme Utilities for SciDigitizeR
#' 
#' Defines standard themes and palettes for major medical journals.
#' Dependencies: ggplot2, ggpubr

library(ggplot2)
library(ggpubr)

# ==============================================================================
# Color Palettes (Hex Codes)
# ==============================================================================

PALETTES <- list(
  NEJM   = c("#BC3C29", "#0072B5", "#E18727", "#20854E", "#7876B1", "#6F99AD", "#FFDC91", "#EE4C97"),
  LANCET = c("#00468B", "#ED0000", "#42B540", "#0099B4", "#925E9F", "#FDAF91", "#AD002A", "#ADB6B6"),
  NATURE = c("#E64B35", "#4DBBD5", "#00A087", "#3C5488", "#F39B7F", "#8491B4", "#91D1C2", "#DC0000"),
  JCO    = c("#00468B", "#ED0000", "#42B540", "#0099B4", "#925E9F", "#FDAF91", "#AD002A", "#ADB6B6"), # Sim to Lancet
  Simple = c("#2E4E7E", "#FF8C00", "#444444", "#DDDDDD")
)

# ==============================================================================
# Theme Factory
# ==============================================================================

#' Get Journal Theme
#' 
#' Returns a ggplot2 theme object configured for specific journals.
#'
#' @param journal_name Character string: "NEJM", "LANCET", "NATURE", or "JCO".
#' @param font_size Base font size (default 12).
#' @param font_family Font family (default "Arial", can use "sans").
#' @return A ggplot theme object.
#' @export
get_journal_theme <- function(journal_name = "NEJM", font_size = 12, font_family = "sans") {
  
  journal_name <- toupper(journal_name)
  
  if (journal_name == "NEJM") {
    return(theme_pubr(base_size = font_size, base_family = font_family) +
             theme(
               panel.grid.major.y = element_line(color = "grey90", size = 0.5), # Horizontal logic
               panel.grid.major.x = element_blank(),
               legend.position = "top",
               plot.title = element_text(face = "bold", hjust = 0.5),
               axis.line = element_line(size = 0.8)
             ))
  } 
  
  else if (journal_name == "LANCET") {
    return(theme_pubclean(base_size = font_size, base_family = font_family) + 
             theme(
               legend.position = "bottom",
               axis.title = element_text(face = "bold"),
               panel.grid.major.y = element_line(color = "grey85"),
               plot.background = element_rect(fill = "white", color = NA)
             ))
  }
  
  else if (journal_name == "NATURE") {
    return(theme_classic(base_size = font_size, base_family = font_family) +
             theme(
               axis.text = element_text(color = "black"),
               axis.ticks = element_line(color = "black"),
               legend.position = "right"
             ))
  }
  
  else {
    # Default to simple clean theme
    return(theme_classic(base_size = font_size, base_family = font_family))
  }
}

#' Get Color Palette
#'
#' @param journal_name Character string
#' @return Vector of hex color codes
#' @export
get_palette <- function(journal_name = "NEJM") {
  journal_name <- toupper(journal_name)
  if (journal_name %in% names(PALETTES)) {
    return(PALETTES[[journal_name]])
  } else {
    return(PALETTES[["Simple"]])
  }
}

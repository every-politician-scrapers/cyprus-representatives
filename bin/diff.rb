#!/bin/env ruby
# frozen_string_literal: true

require 'every_politician_scraper/comparison'
require 'every_politician_scraper/scraper_data'
require 'pry'

# from https://stackoverflow.com/questions/1791639/converting-upper-case-string-into-title-case-using-ruby
class String
  def titlecase
    split(/([[:alpha:]]+)/).map(&:capitalize).join
  end
end

# Standardise data
class Comparison < EveryPoliticianScraper::Comparison
  REMAP = {
    party:        {},
    constituency: {},
  }.freeze

  CSV::Converters[:remap] = lambda { |val, field|
    return (REMAP[field.header] || {}).fetch(val, val) unless field.header == :name

    name = MemberList::Member::Name.new(
      full:     val,
      prefixes: %w[Dr]
    ).short
    name.match(/^([A-Z]+) (.*)/) ? Regexp.last_match.captures.reverse.join(' ').titlecase : name
  }

  def wikidata_csv_options
    { converters: [:remap] }
  end

  def external_csv_options
    { converters: [:remap] }
  end
end

diff = Comparison.new('wikidata/results/current-members.csv', 'data/official.csv').diff
puts diff.sort_by { |r| [r.first.to_s, r[1].to_s] }.reverse.map(&:to_csv)

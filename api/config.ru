# This file is used by Rack-based servers to start the application.

use Rack::Rewrite do
  rewrite %r{^(?!.*(api|\.)).*$}, '/index.html'
end

require ::File.expand_path('../config/environment', __FILE__)

# Action Cable requires that all classes are loaded in advance
Rails.application.eager_load!

run Rails.application
